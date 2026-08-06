# Stage 4 - SQLite Exploration

I opened the SQLite database through the app's database connection and ran the required SQL queries manually.

Database file:

```text
tasks.db
```

Queries executed:

```sql
SELECT * FROM tasks;
SELECT * FROM tasks WHERE done = 1;
SELECT COUNT(*) FROM tasks;
UPDATE tasks SET done = 1;
DELETE FROM tasks WHERE done = 1;
```

Observed results:

```text
SELECT * FROM tasks;
id  title                     done
1   Learn Express basics      1
2   Build a CRUD API          0
3   Connect CRUD to SQLite    0
4   Survives restart          0

SELECT * FROM tasks WHERE done = 1;
id  title                   done
1   Learn Express basics    1

SELECT COUNT(*) FROM tasks;
count
4

UPDATE tasks SET done = 1;
changes: 4

DELETE FROM tasks WHERE done = 1;
changes: 4
```

After the manual SQL changes, the API reflected the changed database contents because every CRUD endpoint reads from SQLite instead of an in-memory array.
