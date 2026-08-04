# Hacar Academy MVP

Eerste productieklare MVP van het Hacar Academy-progressieportaal.

## Functionaliteit

- Supabase e-mail/wachtwoord-login en blijvende sessies
- Rollen: beheerder, docent en manager
- Vestigingen: Amsterdam, Utrecht en Moordrecht
- Beveiligd leerlingenzicht per rol, vestiging en koppeling
- Beheer van echte gebruikers via een Supabase Edge Function
- Beheer van leerlingen en docent-/managerkoppelingen
- 14 technische Academy-modules
- 15 soft-skillcompetenties
- Scores van 1 t/m 5 en opmerkingen per moduleonderdeel
- Historie van gewijzigde scores in de database
- Maandrapporten met momentopnames
- Jaarontwikkeling en managementanalyses
- Officieel Hacar Academy-logo

Lees eerst `START_HIER.txt`.

## Environment variables

```env
VITE_SUPABASE_URL=https://jouw-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Nooit een `service_role` key in Vercel of frontendcode plaatsen.

## Build

```bash
npm install
npm run build
```
