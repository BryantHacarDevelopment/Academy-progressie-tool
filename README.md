# Hacar Academy Progressieportaal

Productieversie op basis van de goedgekeurde klikbare preview, met het officiële Hacar Academy-logo.

## Inbegrepen

- echte Supabase-login;
- rollen: beheerder, docent en manager;
- vestigingen Amsterdam, Utrecht en Moordrecht;
- managerzicht op toegewezen leerlingen en de eigen vestiging;
- beheerder kan echte Supabase-gebruikers aanmaken via een beveiligde Edge Function;
- 14 technische modules met beoordeelbare onderdelen;
- 15 soft-skillcompetenties;
- scores 1 t/m 5;
- opmerkingen per module, onderdeel en competentie;
- maandrapporten en jaarontwikkeling;
- managementanalyses;
- Row Level Security;
- officieel logo op de loginpagina, laadschermen en bovenbalk.

Lees eerst `START_HIER.txt` en werk in een aparte GitHub-branch.

## Gebruikers toevoegen

De knop in **Beheer > Gebruikers** maakt een echte gebruiker aan in Supabase Auth. De frontend roept daarvoor `admin-create-user` aan. Die Edge Function controleert de ingelogde sessie en controleert vervolgens in `profiles` of de aanvrager een actieve beheerder is. De geheime beheersleutel staat niet in de browser.

## Scoreverdeling

1. Onvoldoende
2. Basis
3. Voldoende met begeleiding
4. Goed en grotendeels zelfstandig
5. Zelfstandig en gevorderd

Een leeg veld betekent: nog niet beoordeeld.

## PDF

PDF-export is de volgende fase, nadat de gegevensinvoer, rollen en rapportages in de praktijk zijn getest.
