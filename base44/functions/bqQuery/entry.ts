import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const sql = typeof body.sql === 'string' ? body.sql.trim() : '';
    if (!sql || sql.length > 2000) {
      return Response.json({ error: 'ต้องระบุ sql (ไม่เกิน 2000 ตัวอักษร)' }, { status: 400 });
    }
    if (/;/s.test(sql)) {
      return Response.json({ error: 'ห้ามมีเครื่องหมาย ; ในคำสั่งเดียว' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlebigquery');
    if (!accessToken) {
      return Response.json({ error: 'ยังไม่ได้เชื่อม Google BigQuery' }, { status: 400 });
    }

    let projectId = typeof body.projectId === 'string' ? body.projectId : '';
    if (!projectId) {
      const projRes = await fetch('https://cloudresourcemanager.googleapis.com/v1/projects?pageSize=20', {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(10000),
      });
      const projData = await projRes.json();
      const projects = (projData.projects || []).filter((p) => p.lifecycleState === 'ACTIVE');
      if (!projects.length) {
        return Response.json({ error: 'ไม่พบโปรเจกต์ใน GCP ของคุณ', raw: projData }, { status: 404 });
      }
      projectId = projects[0].projectId;
    }

    const qRes = await fetch(`https://bigquery.googleapis.com/bigquery/v2/projects/${encodeURIComponent(projectId)}/queries`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql, useQueryCache: true, maxResults: 200 }),
      signal: AbortSignal.timeout(15000),
    });
    const qData = await qRes.json();
    if (!qRes.ok) {
      return Response.json({ error: qData.error?.message || 'BigQuery error', projectId }, { status: qRes.status });
    }

    const fields = (qData.schema?.fields || []).map((f) => f.name);
    const rows = (qData.rows || []).map((row) => {
      const obj = {};
      row.f.forEach((cell, i) => { obj[fields[i]] = cell.v; });
      return obj;
    });

    return Response.json({ projectId, fields, rows, totalRows: qData.totalRows || String(rows.length) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
