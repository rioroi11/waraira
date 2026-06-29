// Waraira — Códigos telefónicos por país (con bandera). Venezuela primero (por defecto),
// luego el resto por nombre. Cubre los destinos de la diáspora venezolana y más.

export interface Pais {
  iso: string;
  nombre: string;
  bandera: string;
  codigo: string; // prefijo internacional, con "+"
}

export const PAISES: Pais[] = [
  { iso: "VE", nombre: "Venezuela", bandera: "🇻🇪", codigo: "+58" },
  { iso: "AR", nombre: "Argentina", bandera: "🇦🇷", codigo: "+54" },
  { iso: "AW", nombre: "Aruba", bandera: "🇦🇼", codigo: "+297" },
  { iso: "AU", nombre: "Australia", bandera: "🇦🇺", codigo: "+61" },
  { iso: "AT", nombre: "Austria", bandera: "🇦🇹", codigo: "+43" },
  { iso: "BE", nombre: "Bélgica", bandera: "🇧🇪", codigo: "+32" },
  { iso: "BO", nombre: "Bolivia", bandera: "🇧🇴", codigo: "+591" },
  { iso: "BR", nombre: "Brasil", bandera: "🇧🇷", codigo: "+55" },
  { iso: "CA", nombre: "Canadá", bandera: "🇨🇦", codigo: "+1" },
  { iso: "CL", nombre: "Chile", bandera: "🇨🇱", codigo: "+56" },
  { iso: "CO", nombre: "Colombia", bandera: "🇨🇴", codigo: "+57" },
  { iso: "CR", nombre: "Costa Rica", bandera: "🇨🇷", codigo: "+506" },
  { iso: "CU", nombre: "Cuba", bandera: "🇨🇺", codigo: "+53" },
  { iso: "CW", nombre: "Curazao", bandera: "🇨🇼", codigo: "+599" },
  { iso: "DK", nombre: "Dinamarca", bandera: "🇩🇰", codigo: "+45" },
  { iso: "EC", nombre: "Ecuador", bandera: "🇪🇨", codigo: "+593" },
  { iso: "SV", nombre: "El Salvador", bandera: "🇸🇻", codigo: "+503" },
  { iso: "ES", nombre: "España", bandera: "🇪🇸", codigo: "+34" },
  { iso: "US", nombre: "Estados Unidos", bandera: "🇺🇸", codigo: "+1" },
  { iso: "FR", nombre: "Francia", bandera: "🇫🇷", codigo: "+33" },
  { iso: "DE", nombre: "Alemania", bandera: "🇩🇪", codigo: "+49" },
  { iso: "GT", nombre: "Guatemala", bandera: "🇬🇹", codigo: "+502" },
  { iso: "GY", nombre: "Guyana", bandera: "🇬🇾", codigo: "+592" },
  { iso: "HN", nombre: "Honduras", bandera: "🇭🇳", codigo: "+504" },
  { iso: "IE", nombre: "Irlanda", bandera: "🇮🇪", codigo: "+353" },
  { iso: "IT", nombre: "Italia", bandera: "🇮🇹", codigo: "+39" },
  { iso: "MX", nombre: "México", bandera: "🇲🇽", codigo: "+52" },
  { iso: "NI", nombre: "Nicaragua", bandera: "🇳🇮", codigo: "+505" },
  { iso: "NO", nombre: "Noruega", bandera: "🇳🇴", codigo: "+47" },
  { iso: "NL", nombre: "Países Bajos", bandera: "🇳🇱", codigo: "+31" },
  { iso: "PA", nombre: "Panamá", bandera: "🇵🇦", codigo: "+507" },
  { iso: "PY", nombre: "Paraguay", bandera: "🇵🇾", codigo: "+595" },
  { iso: "PE", nombre: "Perú", bandera: "🇵🇪", codigo: "+51" },
  { iso: "PL", nombre: "Polonia", bandera: "🇵🇱", codigo: "+48" },
  { iso: "PT", nombre: "Portugal", bandera: "🇵🇹", codigo: "+351" },
  { iso: "GB", nombre: "Reino Unido", bandera: "🇬🇧", codigo: "+44" },
  { iso: "DO", nombre: "Rep. Dominicana", bandera: "🇩🇴", codigo: "+1" },
  { iso: "CZ", nombre: "República Checa", bandera: "🇨🇿", codigo: "+420" },
  { iso: "SE", nombre: "Suecia", bandera: "🇸🇪", codigo: "+46" },
  { iso: "CH", nombre: "Suiza", bandera: "🇨🇭", codigo: "+41" },
  { iso: "TT", nombre: "Trinidad y Tobago", bandera: "🇹🇹", codigo: "+1" },
  { iso: "UY", nombre: "Uruguay", bandera: "🇺🇾", codigo: "+598" },
];

export const PAIS_DEFECTO = PAISES[0]; // Venezuela
