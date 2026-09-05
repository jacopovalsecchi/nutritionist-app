# Studio nutrizionista

Step 1: scheletro dell’app (login + sezioni vuote). Calendario, file e WhatsApp arrivano dopo.

## Avvio in locale

1. Avvia Docker Desktop.
2. Copia le variabili d’ambiente se non hai già `.env`:

```bash
cp .env.example .env
```

3. Database e app:

```bash
npm run db:up
npx prisma generate
npm run dev
```

4. Apri [http://localhost:3000](http://localhost:3000)

Accesso di default (da cambiare in `.env`):

- Email: `nutrizionista@local`
- Password: `changeme`

## Cosa c’è in questo step

- Next.js + TypeScript + React
- Postgres via Docker Compose
- Prisma collegato (ancora senza modelli di dominio)
- Login del nutrizionista
- Menu: Dashboard, Clienti, Impostazioni (placeholder)
