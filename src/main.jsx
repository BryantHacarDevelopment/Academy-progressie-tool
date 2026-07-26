import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, LogOut, ShieldCheck, BarChart3, UserPlus, 
  Search, Filter, Calendar, Award, Clock, ChevronRight, 
  ArrowLeft, Save, CheckCircle2, BookOpen, FileText, 
  ChevronUp, ChevronDown, TrendingUp, Minus, MessageSquare, Lock, Mail
} from 'lucide-react';

if (typeof document !== 'undefined' && !document.getElementById('poppins-font-link')) {
  const link = document.createElement('link');
  link.id = 'poppins-font-link';
  link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

if (typeof document !== 'undefined' && !document.getElementById('supabase-js-script')) {
  const script = document.createElement('script');
  script.id = 'supabase-js-script';
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  document.head.appendChild(script);
}

const getSupabaseClient = () => {
  if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
    const envUrl = typeof process !== 'undefined' && process.env ? process.env.VITE_SUPABASE_URL : (window.VITE_SUPABASE_URL || '');
    const envKey = typeof process !== 'undefined' && process.env ? process.env.VITE_SUPABASE_ANON_KEY : (window.VITE_SUPABASE_ANON_KEY || '');
    if (envUrl && envKey) {
      return window.supabase.createClient(envUrl, envKey);
    }
  }
  return null;
};

const MOCK_STUDENTS = [
  {
    id: '1', name: 'Jan de Vries', photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    startDate: '01-09-2025', currentMonth: 6, progressPercentage: 78, competencyScore: 2.7,
    lastUpdated: '22-07-2026', status: 'Loopt voor', teacher: 'Mark Visser',
    historyScores: [10, 25, 45, 60, 72, 78]
  },
  {
    id: '2', name: 'Daan van Dijk', photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
    startDate: '01-11-2025', currentMonth: 4, progressPercentage: 52, competencyScore: 2.1,
    lastUpdated: '18-07-2026', status: 'Op schema', teacher: 'Mark Visser',
    historyScores: [5, 15, 30, 52]
  },
  {
    id: '3', name: 'Sanne Bakker', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    startDate: '15-01-2026', currentMonth: 2, progressPercentage: 25, competencyScore: 1.6,
    lastUpdated: '10-07-2026', status: 'Aandacht nodig', teacher: 'Peter Hermans',
    historyScores: [10, 25]
  },
  {
    id: '4', name: 'Lars Meijer', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    startDate: '01-02-2026', currentMonth: 1, progressPercentage: 15, competencyScore: 2.0,
    lastUpdated: '21-07-2026', status: 'Op schema', teacher: 'Peter Hermans',
    historyScores: [15]
  }
];

const MODULES_DATA = [
  { id: 'm1', title: '1. Persoonlijke veiligheid', items: ['PBM’s correct gebruiken', 'Elektrische gevaren herkennen', 'Spanningsloos werken', 'Spanningsloosheid controleren', 'LMRA uitvoeren', 'Gereedschap vooraf controleren', 'Veilig samenwerken', 'Handelen bij noodsituaties'] },
  { id: 'm2', title: '2. Elektrotechniek basisvaardigheden', items: ['Multimeter gebruiken', 'Tweepolige spanningstester gebruiken', 'Ampèretang gebruiken', 'Installatietester gebruiken', 'Aardlektester gebruiken', 'Isolatieweerstand meten', 'Handgereedschap gebruiken', 'Elektrisch gereedschap gebruiken', 'Kabels, draden en materialen herkennen'] },
  { id: 'm3', title: '3. Monteren van leiding- en draadwerk', items: ['Inbouw en opbouw onderscheiden', 'Juiste buissoort kiezen', 'Buisdiameter en buisvulling bepalen', 'Leidingwerk monteren', 'Inbouwdozen plaatsen', 'Lasdozen en kabeldozen toepassen', 'Juiste draadkleuren gebruiken', 'Draad correct strippen', 'Installatiedraad trekken', 'Elektrische verbindingen maken', 'Leidingwerk controleren en netjes afwerken'] },
  { id: 'm4', title: '4. Wisselspanning en gelijkspanning', items: ['AC en DC onderscheiden', 'Toepassingen herkennen', 'Polariteit begrijpen', 'Juiste meetinstelling kiezen', 'AC meten', 'DC meten', 'Omvormers, gelijkrichters en voedingen herkennen'] },
  { id: 'm5', title: '5. Elektrische grootheden en formules', items: ['Spanning herkennen', 'Stroom herkennen', 'Weerstand herkennen', 'Vermogen herkennen', 'Eenheden toepassen', 'P = U × I gebruiken', 'Eenvoudige berekeningen uitvoeren', 'Meetwaarde met berekening vergelijken'] },
  { id: 'm6', title: '6. Schakelingen, schema’s en symbolen', items: ['Elektrische symbolen herkennen', 'Eenvoudige tekening lezen', 'Eenvoudig schema tekenen', 'Serieschakeling begrijpen', 'Parallelschakeling begrijpen', 'Enkelpolige schakeling maken', 'Wisselschakeling maken', 'Kruisschakeling maken', 'Schakeling testen', 'Eenvoudige fout opsporen'] },
  { id: 'm7', title: '7. Rookmelders', items: ['Rookmelder correct plaatsen', 'Rookmelder testen', 'Levensduur en vervangingsdatum controleren'] },
  { id: 'm8', title: '8. Verlichting', items: ['Type armatuur herkennen', 'Geschikt armatuur selecteren', 'Armatuur monteren', 'Armatuur elektrisch aansluiten', 'Aarde correct aansluiten', 'Verlichting testen', 'Eenvoudige storing herkennen', 'Werk netjes opleveren'] },
  { id: 'm9', title: '9. Noodverlichting', items: ['Functie van noodverlichting uitleggen', 'Type noodverlichting herkennen', 'Armatuur inspecteren', 'Noodfunctie testen', 'Accu of batterij controleren', 'Volledige test uitvoeren', 'Keurings- of afkeurstatus vastleggen', 'Armatuurnummer registreren', 'Logboek of looplijst invullen', 'Foto’s correct vastleggen'] },
  { id: 'm10', title: '10. Groepenkasten', items: ['Hoofdschakelaar herkennen', 'Aardlekschakelaar herkennen', 'Installatieautomaat herkennen', 'Aardlekautomaat herkennen', 'Functie van componenten uitleggen', 'Indeling van een groepenkast begrijpen', 'Componenten monteren', 'Bedrading aanbrengen', 'Juiste kleuren en doorsneden toepassen', 'Eenvoudige groep aansluiten', 'Visuele eindcontrole uitvoeren', 'Metingen onder begeleiding uitvoeren'] },
  { id: 'm11', title: '11. Aarding en aardlekschakelaars', items: ['Doel van aarding begrijpen', 'Aardverbinding maken', 'Vereffening herkennen', 'Centraal aardpunt herkennen', 'Badkamerzones herkennen', 'Aardlekschakelaar herkennen', 'Werking aardlekschakelaar uitleggen', 'Aardlektest uitvoeren'] },
  { id: 'm12', title: '12. Bel- en deuropenerinstallaties', items: ['Onderdelen herkennen', 'Transformator herkennen', 'D
