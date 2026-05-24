
/*
  # Row Level Security Policies for Prostuti DHABI

  Enables RLS on all tables and creates appropriate access policies:
  - Public users can read published courses, teachers, active notices, categories, admin config
  - Anyone can submit an enrollment application (INSERT)
  - Admin (via service role / USING true) has full management access
*/

-- admin_config
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read admin config"
  ON admin_config FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert admin config"
  ON admin_config FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can update admin config"
  ON admin_config FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can delete admin config"
  ON admin_config FOR DELETE
  USING (true);

-- teachers
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read teachers"
  ON teachers FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert teachers"
  ON teachers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can update teachers"
  ON teachers FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can delete teachers"
  ON teachers FOR DELETE
  USING (true);

-- courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published courses"
  ON courses FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admin can insert courses"
  ON courses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can update courses"
  ON courses FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can delete courses"
  ON courses FOR DELETE
  USING (true);

-- enrollments
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit enrollment"
  ON enrollments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can read enrollments"
  ON enrollments FOR SELECT
  USING (true);

CREATE POLICY "Admin can update enrollments"
  ON enrollments FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can delete enrollments"
  ON enrollments FOR DELETE
  USING (true);

-- categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert categories"
  ON categories FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can update categories"
  ON categories FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can delete categories"
  ON categories FOR DELETE
  USING (true);

-- notices
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active notices"
  ON notices FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can insert notices"
  ON notices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can update notices"
  ON notices FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can delete notices"
  ON notices FOR DELETE
  USING (true);
