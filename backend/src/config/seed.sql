-- Sample data so you have something to test with right away.
-- Run this AFTER schema.sql.
-- Note: the password hashes below all correspond to a plain password of "Password123!"
-- (generated with bcrypt, 10 salt rounds). Change these before using this for real.

INSERT INTO bases (name, location) VALUES
  ('Fort Alpha', 'Northern Region'),
  ('Fort Bravo', 'Eastern Region')
ON CONFLICT DO NOTHING;

INSERT INTO equipment_types (name, category) VALUES
  ('M4 Carbine', 'WEAPON'),
  ('Humvee', 'VEHICLE'),
  ('5.56mm Ammo', 'AMMUNITION')
ON CONFLICT DO NOTHING;

-- password_hash below = bcrypt hash of "Password123!" (verified, 10 salt rounds)
INSERT INTO users (username, password_hash, role, base_id) VALUES
  ('admin_user', '$2b$10$ns5lMZXhy9291yuTSSuYNO8PqHjrLWIGd1dMvDfgL3DLub/KhqdWm', 'ADMIN', NULL),
  ('commander_alpha', '$2b$10$ns5lMZXhy9291yuTSSuYNO8PqHjrLWIGd1dMvDfgL3DLub/KhqdWm', 'BASE_COMMANDER', 1),
  ('logistics_officer', '$2b$10$ns5lMZXhy9291yuTSSuYNO8PqHjrLWIGd1dMvDfgL3DLub/KhqdWm', 'LOGISTICS_OFFICER', 1)
ON CONFLICT DO NOTHING;
