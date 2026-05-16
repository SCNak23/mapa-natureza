# Como colocar o app no ar

Tempo estimado: 30 minutos. Nenhum conhecimento técnico necessário.

---

## Passo 1 — Criar o banco de dados (Supabase)

1. Acesse **supabase.com** e clique em "Start your project"
2. Crie uma conta gratuita (pode entrar com Google)
3. Clique em **"New project"**
   - Organization: pode deixar o padrão
   - Name: `mapa-natureza`
   - Database Password: escolha uma senha e **anote em algum lugar**
   - Region: escolha **South America (São Paulo)**
4. Aguarde o projeto criar (1-2 minutos)
5. No menu lateral, clique em **SQL Editor**
6. Clique em **"New query"**
7. Abra o arquivo `supabase-schema.sql` (está dentro da pasta do projeto) e copie **todo** o conteúdo
8. Cole no SQL Editor e clique em **Run**
   - Deve aparecer "Success" em verde

**Agora copie as credenciais:**

9. No menu lateral, clique em **Project Settings → API**
10. Copie o valor de **Project URL** — vai precisar no passo 3
11. Copie o valor de **anon / public** (em "Project API keys") — vai precisar no passo 3

---

## Passo 2 — Publicar o site (Vercel)

1. Acesse **github.com** e crie uma conta gratuita (se não tiver)
2. Crie um novo repositório:
   - Clique em **"New repository"**
   - Name: `mapa-natureza`
   - Deixe como **Public**
   - Clique em **"Create repository"**
3. Abra o **Prompt de Comando** ou **PowerShell** no Windows
4. Navegue até a pasta do projeto:
   ```
   cd C:\Users\anak_\mapa-natureza
   ```
5. Execute os comandos abaixo um por um:
   ```
   git init
   git add .
   git commit -m "primeiro commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/mapa-natureza.git
   git push -u origin main
   ```
   (substitua SEU_USUARIO pelo seu usuário do GitHub)

6. Acesse **vercel.com** e clique em "Sign Up" (entre com sua conta GitHub)
7. Clique em **"Add New Project"**
8. Selecione o repositório `mapa-natureza` e clique em **Import**
9. **IMPORTANTE — antes de clicar em Deploy**, clique em **"Environment Variables"** e adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` → cole a URL do passo 1
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → cole a chave anon do passo 1
   - `NEXT_PUBLIC_ADMIN_PASSWORD` → escolha uma senha para o painel admin
10. Clique em **Deploy**
11. Aguarde 2-3 minutos. A Vercel vai gerar um endereço tipo `mapa-natureza.vercel.app`

---

## Passo 3 — Testar

- Acesse o endereço gerado pela Vercel
- O mapa deve abrir pedindo permissão de localização
- Dois parques de exemplo (Trianon e Ibirapuera) já aparecem no mapa
- Para acessar o painel admin: `seusite.vercel.app/admin`

---

## Painel Admin

- Acesse `/admin` no seu site
- Senha: a que você definiu em `NEXT_PUBLIC_ADMIN_PASSWORD`
- Ali você aprova ou rejeita praças e brincadeiras sugeridas pela comunidade

---

## Dúvidas?

Qualquer problema, volte para o Claude Code e descreva o erro — posso ajudar a resolver.
