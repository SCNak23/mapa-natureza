-- Tabela de praças e parques
CREATE TABLE parks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  address TEXT,
  trees TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  suggested_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de brincadeiras
CREATE TABLE play_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id UUID NOT NULL REFERENCES parks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  age_range TEXT,
  materials TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  suggested_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilita Row Level Security
ALTER TABLE parks ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_ideas ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode VER praças e brincadeiras aprovadas
CREATE POLICY "Leitura pública de praças aprovadas"
  ON parks FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Leitura pública de brincadeiras aprovadas"
  ON play_ideas FOR SELECT
  USING (status = 'approved');

-- Qualquer pessoa pode INSERIR sugestões (ficam como 'pending')
CREATE POLICY "Qualquer pessoa pode sugerir praças"
  ON parks FOR INSERT
  WITH CHECK (status = 'pending');

CREATE POLICY "Qualquer pessoa pode sugerir brincadeiras"
  ON play_ideas FOR INSERT
  WITH CHECK (status = 'pending');

-- Admin pode ver TUDO (incluindo pendentes) — via service role key
-- (o painel admin usa a anon key, então precisamos de políticas para leitura de pendentes)
CREATE POLICY "Leitura de todas as praças (inclui pendentes)"
  ON parks FOR SELECT
  USING (true);

CREATE POLICY "Leitura de todas as brincadeiras (inclui pendentes)"
  ON play_ideas FOR SELECT
  USING (true);

-- Admin pode atualizar e deletar (via service role no painel)
CREATE POLICY "Atualização de praças"
  ON parks FOR UPDATE
  USING (true);

CREATE POLICY "Exclusão de praças"
  ON parks FOR DELETE
  USING (true);

CREATE POLICY "Atualização de brincadeiras"
  ON play_ideas FOR UPDATE
  USING (true);

CREATE POLICY "Exclusão de brincadeiras"
  ON play_ideas FOR DELETE
  USING (true);

-- Dados de exemplo para começar
INSERT INTO parks (name, description, latitude, longitude, address, trees, status) VALUES
(
  'Parque Trianon',
  'Fragmento de Mata Atlântica no coração de São Paulo. Ótimo para observar árvores nativas.',
  -23.5711, -46.6544,
  'Av. Paulista, 1351 – Bela Vista, São Paulo',
  ARRAY['figueira', 'ipê', 'pau-brasil', 'bromélias'],
  'approved'
),
(
  'Parque Ibirapuera',
  'Um dos maiores parques urbanos do Brasil, com muitas árvores para explorar.',
  -23.5874, -46.6576,
  'Av. Pedro Álvares Cabral – Vila Mariana, São Paulo',
  ARRAY['jacarandá', 'sibipiruna', 'quaresmeira', 'eucalipto'],
  'approved'
);

INSERT INTO play_ideas (park_id, title, description, age_range, materials, status)
SELECT
  id,
  'Caça às sementes',
  'Procure sementes caídas no chão e tente descobrir de qual árvore vieram. Depois monte uma coleção em potes pequenos com etiqueta.',
  '4–10 anos',
  'potes pequenos, etiquetas, lupa',
  'approved'
FROM parks WHERE name = 'Parque Trianon';

INSERT INTO play_ideas (park_id, title, description, age_range, materials, status)
SELECT
  id,
  'Abraço de árvore',
  'Cada criança escolhe uma árvore favorita, a abraça e tenta medir quantos "abraços" ela tem de espessura. Depois de olhos fechados, tente encontrar a mesma árvore pelo tato.',
  '3–8 anos',
  'nenhum',
  'approved'
FROM parks WHERE name = 'Parque Ibirapuera';
