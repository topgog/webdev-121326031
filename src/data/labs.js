function createLabsData(db) {
  const list = db.prepare(`
    SELECT l.id, l.name, COUNT(w.id) AS workstations
    FROM labs l LEFT JOIN workstations w ON w.lab_id = l.id
    GROUP BY l.id
    ORDER BY l.name`);
  const insertLab = db.prepare('INSERT INTO labs (name) VALUES (?)');
  const insertWorkstation = db.prepare('INSERT INTO workstations (lab_id, name) VALUES (?, ?)');

  return {
    listWithWorkstationCount: () => list.all().map((row) => ({ id: row.id, name: row.name, workstations: row.workstations })),
    create: (name) => Number(insertLab.run(name).lastInsertRowid),
    addWorkstation: (labId, name) => Number(insertWorkstation.run(labId, name).lastInsertRowid),
  };
}

module.exports = { createLabsData };
