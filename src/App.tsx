import { useEffect, useMemo, useState } from "react";
import AdminEditor from "./AdminEditor";
import { loadStoredSiteConfig, SiteConfig } from "./siteConfig";

const WHATSAPP_NUMBER = "5519996514827";
const buildWhatsappUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
const logoSrc = `${import.meta.env.BASE_URL}logo-renovera.png`;

const CONFIG = {
  modulePowerWp: 585,
  lossesPercent: 20,
  dcAcFactor: 1.15,
  areaPerModuleM2: 2.6,
  defaultTariff: 0.9,
  investmentPerKwpBeforeMultiplier: 1000,
  investmentMultiplier: 2,
};

type Mode = "consumo" | "potencia";
type RoofType = "CerÃƒÂ¢mica" | "Solo" | "Fibrocimento" | "MetÃƒÂ¡lico" | "Laje";
type TensionType = "MonofÃƒÂ¡sico 220 V" | "TrifÃƒÂ¡sico 220 V" | "TrifÃƒÂ¡sico 380 V";
type UfKey =
  | "AC" | "AL" | "AP" | "AM" | "BA" | "CE" | "DF" | "ES" | "GO" | "MA"
  | "MT" | "MS" | "MG" | "PA" | "PB" | "PR" | "PE" | "PI" | "RJ" | "RN"
  | "RS" | "RO" | "RR" | "SC" | "SP" | "SE" | "TO";

const hspPorUf: Record<UfKey, number> = {
  AC: 4.8,
  AL: 5.45,
  AP: 4.95,
  AM: 4.65,
  BA: 5.55,
  CE: 5.7,
  DF: 5.55,
  ES: 5.2,
  GO: 5.56,
  MA: 5.35,
  MT: 5.4,
  MS: 5.25,
  MG: 5.25,
  PA: 5.25,
  PB: 5.65,
  PR: 5.05,
  PE: 5.55,
  PI: 5.7,
  RJ: 5.15,
  RN: 5.75,
  RS: 4.65,
  RO: 4.95,
  RR: 5.05,
  SC: 4.85,
  SP: 5.33,
  SE: 5.45,
  TO: 5.5,
};

const cidadesPorUf: Record<UfKey, string[]> = {
  AC: ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "TarauacÃƒÂ¡", "FeijÃƒÂ³", "Outra cidade"],
  AL: ["MaceiÃƒÂ³", "Arapiraca", "Rio Largo", "Palmeira dos ÃƒÂndios", "Penedo", "Outra cidade"],
  AP: ["MacapÃƒÂ¡", "Santana", "Laranjal do Jari", "Oiapoque", "Porto Grande", "Outra cidade"],
  AM: ["Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Coari", "Outra cidade"],
  BA: ["Salvador", "Feira de Santana", "VitÃƒÂ³ria da Conquista", "CamaÃƒÂ§ari", "Juazeiro", "Lauro de Freitas", "IlhÃƒÂ©us", "Barreiras", "Outra cidade"],
  CE: ["Fortaleza", "Caucaia", "Juazeiro do Norte", "MaracanaÃƒÂº", "Sobral", "Crato", "Iguatu", "Outra cidade"],
  DF: ["BrasÃƒÂ­lia", "CeilÃƒÂ¢ndia", "Taguatinga", "Samambaia", "ÃƒÂguas Claras", "Gama", "Outra cidade"],
  ES: ["VitÃƒÂ³ria", "Vila Velha", "Serra", "Cariacica", "Linhares", "Colatina", "Cachoeiro de Itapemirim", "SÃƒÂ£o Mateus", "Outra cidade"],
  GO: ["GoiÃƒÂ¢nia", "Aparecida de GoiÃƒÂ¢nia", "AnÃƒÂ¡polis", "Rio Verde", "LuziÃƒÂ¢nia", "ÃƒÂguas Lindas de GoiÃƒÂ¡s", "CatalÃƒÂ£o", "Itumbiara", "Outra cidade"],
  MA: ["SÃƒÂ£o LuÃƒÂ­s", "Imperatriz", "Timon", "Caxias", "CodÃƒÂ³", "Bacabal", "Balsas", "Outra cidade"],
  MT: ["CuiabÃƒÂ¡", "VÃƒÂ¡rzea Grande", "RondonÃƒÂ³polis", "Sinop", "TangarÃƒÂ¡ da Serra", "Sorriso", "Lucas do Rio Verde", "Primavera do Leste", "Outra cidade"],
  MS: ["Campo Grande", "Dourados", "TrÃƒÂªs Lagoas", "CorumbÃƒÂ¡", "Ponta PorÃƒÂ£", "NaviraÃƒÂ­", "Aquidauana", "Outra cidade"],
  MG: ["Belo Horizonte", "UberlÃƒÂ¢ndia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "RibeirÃƒÂ£o das Neves", "Uberaba", "Governador Valadares", "DivinÃƒÂ³polis", "PoÃƒÂ§os de Caldas", "Pouso Alegre", "SÃƒÂ£o JoÃƒÂ£o del-Rei", "Outra cidade"],
  PA: ["BelÃƒÂ©m", "Ananindeua", "SantarÃƒÂ©m", "MarabÃƒÂ¡", "Parauapebas", "Castanhal", "Altamira", "Outra cidade"],
  PB: ["JoÃƒÂ£o Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux", "Sousa", "Cajazeiras", "Outra cidade"],
  PR: ["Curitiba", "Londrina", "MaringÃƒÂ¡", "Ponta Grossa", "Cascavel", "SÃƒÂ£o JosÃƒÂ© dos Pinhais", "Foz do IguaÃƒÂ§u", "Colombo", "Outra cidade"],
  PE: ["Recife", "JaboatÃƒÂ£o dos Guararapes", "Olinda", "Caruaru", "Petrolina", "Paulista", "Cabo de Santo Agostinho", "Outra cidade"],
  PI: ["Teresina", "ParnaÃƒÂ­ba", "Picos", "Piripiri", "Floriano", "Campo Maior", "Outra cidade"],
  RJ: ["Rio de Janeiro", "SÃƒÂ£o GonÃƒÂ§alo", "Duque de Caxias", "Nova IguaÃƒÂ§u", "NiterÃƒÂ³i", "Belford Roxo", "Campos dos Goytacazes", "PetrÃƒÂ³polis", "Volta Redonda", "Outra cidade"],
  RN: ["Natal", "MossorÃƒÂ³", "Parnamirim", "SÃƒÂ£o GonÃƒÂ§alo do Amarante", "MacaÃƒÂ­ba", "CearÃƒÂ¡-Mirim", "Outra cidade"],
  RS: ["Porto Alegre", "Caxias do Sul", "Canoas", "Pelotas", "Santa Maria", "GravataÃƒÂ­", "ViamÃƒÂ£o", "Novo Hamburgo", "SÃƒÂ£o Leopoldo", "Outra cidade"],
  RO: ["Porto Velho", "Ji-ParanÃƒÂ¡", "Ariquemes", "Vilhena", "Cacoal", "Rolim de Moura", "Outra cidade"],
  RR: ["Boa Vista", "RorainÃƒÂ³polis", "CaracaraÃƒÂ­", "Alto Alegre", "MucajaÃƒÂ­", "Outra cidade"],
  SC: ["Joinville", "FlorianÃƒÂ³polis", "Blumenau", "SÃƒÂ£o JosÃƒÂ©", "ChapecÃƒÂ³", "ItajaÃƒÂ­", "CriciÃƒÂºma", "JaraguÃƒÂ¡ do Sul", "PalhoÃƒÂ§a", "Outra cidade"],
  SP: ["SÃƒÂ£o Paulo", "Campinas", "Guarulhos", "SÃƒÂ£o Bernardo do Campo", "Santo AndrÃƒÂ©", "Osasco", "RibeirÃƒÂ£o Preto", "Sorocaba", "SÃƒÂ£o JosÃƒÂ© dos Campos", "SÃƒÂ£o JosÃƒÂ© do Rio Preto", "JundiaÃƒÂ­", "Piracicaba", "Bauru", "Araraquara", "SÃƒÂ£o Carlos", "Rio Claro", "Limeira", "Mogi GuaÃƒÂ§u", "Mogi Mirim", "SÃƒÂ£o JoÃƒÂ£o da Boa Vista", "Outra cidade"],
  SE: ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "SÃƒÂ£o CristÃƒÂ³vÃƒÂ£o", "EstÃƒÂ¢ncia", "Outra cidade"],
  TO: ["Palmas", "AraguaÃƒÂ­na", "Gurupi", "Porto Nacional", "ParaÃƒÂ­so do Tocantins", "Colinas do Tocantins", "Outra cidade"],
};

const disponibilidadePorTensao: Record<TensionType, number> = {
  "MonofÃƒÂ¡sico 220 V": 30,
  "TrifÃƒÂ¡sico 220 V": 100,
  "TrifÃƒÂ¡sico 380 V": 100,
};

const monthlyFactors = [
  { month: "Jan", days: 31 },
  { month: "Fev", days: 28 },
  { month: "Mar", days: 31 },
  { month: "Abr", days: 30 },
  { month: "Mai", days: 31 },
  { month: "Jun", days: 30 },
  { month: "Jul", days: 31 },
  { month: "Ago", days: 31 },
  { month: "Set", days: 30 },
  { month: "Out", days: 31 },
  { month: "Nov", days: 30 },
  { month: "Dez", days: 31 },
];

const seasonalProfileByUf: Record<UfKey, number[]> = {
  AC: [0.86, 0.84, 0.86, 0.90, 0.96, 1.03, 1.10, 1.15, 1.16, 1.08, 0.98, 0.90],
  AL: [1.05, 1.05, 1.02, 0.96, 0.90, 0.86, 0.90, 0.98, 1.05, 1.11, 1.08, 1.04],
  AP: [0.82, 0.80, 0.83, 0.90, 1.00, 1.10, 1.18, 1.22, 1.16, 1.04, 0.92, 0.83],
  AM: [0.82, 0.80, 0.83, 0.89, 0.98, 1.08, 1.17, 1.22, 1.18, 1.06, 0.93, 0.84],
  BA: [1.06, 1.06, 1.02, 0.96, 0.90, 0.86, 0.91, 1.00, 1.08, 1.12, 1.10, 1.06],
  CE: [1.03, 1.00, 0.96, 0.92, 0.94, 0.99, 1.05, 1.12, 1.17, 1.17, 1.10, 1.05],
  DF: [0.96, 0.98, 1.00, 1.04, 1.06, 1.04, 1.07, 1.14, 1.12, 1.06, 0.94, 0.88],
  ES: [1.09, 1.08, 1.02, 0.93, 0.86, 0.82, 0.86, 0.94, 1.02, 1.10, 1.13, 1.10],
  GO: [0.96, 0.98, 1.00, 1.04, 1.06, 1.04, 1.08, 1.15, 1.13, 1.06, 0.94, 0.88],
  MA: [0.98, 0.94, 0.90, 0.92, 0.98, 1.04, 1.12, 1.18, 1.16, 1.09, 1.02, 0.97],
  MT: [0.94, 0.95, 0.98, 1.03, 1.06, 1.05, 1.10, 1.16, 1.15, 1.08, 0.95, 0.88],
  MS: [1.09, 1.06, 1.00, 0.92, 0.86, 0.80, 0.86, 0.96, 1.05, 1.13, 1.15, 1.12],
  MG: [1.05, 1.05, 1.01, 0.96, 0.90, 0.86, 0.91, 1.01, 1.08, 1.12, 1.07, 0.98],
  PA: [0.86, 0.83, 0.85, 0.90, 0.97, 1.06, 1.15, 1.21, 1.17, 1.06, 0.95, 0.86],
  PB: [1.04, 1.02, 0.98, 0.92, 0.88, 0.86, 0.92, 1.02, 1.10, 1.15, 1.12, 1.07],
  PR: [1.16, 1.10, 1.02, 0.89, 0.76, 0.70, 0.76, 0.89, 0.99, 1.11, 1.19, 1.23],
  PE: [1.05, 1.03, 0.99, 0.93, 0.88, 0.86, 0.91, 1.00, 1.09, 1.14, 1.12, 1.07],
  PI: [1.00, 0.96, 0.92, 0.94, 1.00, 1.06, 1.13, 1.19, 1.18, 1.10, 1.03, 0.98],
  RJ: [1.12, 1.10, 1.03, 0.93, 0.84, 0.78, 0.84, 0.94, 1.04, 1.13, 1.17, 1.16],
  RN: [1.03, 1.00, 0.96, 0.91, 0.89, 0.92, 0.99, 1.08, 1.15, 1.17, 1.12, 1.06],
  RS: [1.24, 1.15, 1.02, 0.84, 0.68, 0.60, 0.67, 0.83, 0.99, 1.15, 1.27, 1.33],
  RO: [0.86, 0.84, 0.87, 0.92, 0.99, 1.07, 1.15, 1.20, 1.15, 1.05, 0.94, 0.86],
  RR: [1.03, 1.02, 1.01, 0.99, 0.94, 0.89, 0.88, 0.93, 1.03, 1.10, 1.11, 1.07],
  SC: [1.20, 1.13, 1.02, 0.86, 0.72, 0.65, 0.72, 0.87, 1.00, 1.14, 1.22, 1.27],
  SP: [1.14, 1.10, 1.03, 0.92, 0.82, 0.75, 0.82, 0.95, 1.04, 1.12, 1.16, 1.16],
  SE: [1.06, 1.05, 1.00, 0.94, 0.89, 0.86, 0.91, 1.00, 1.08, 1.13, 1.10, 1.06],
  TO: [0.96, 0.96, 0.98, 1.02, 1.06, 1.05, 1.10, 1.16, 1.15, 1.08, 0.96, 0.90],
};

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq-item ${open ? "open" : ""}`}>
      <button className="faq-question" onClick={() => setOpen(!open)} type="button">
        <span>{question}</span>
        <span className="faq-icon">{open ? "Ã¢Ë†â€™" : "+"}</span>
      </button>
      {open && <div className="faq-answer">{answer}</div>}
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M16 3.2A12.7 12.7 0 0 0 5.1 22.4L3.6 28.8l6.6-1.5A12.7 12.7 0 1 0 16 3.2Zm0 22.9c-2 0-3.9-.6-5.6-1.7l-.4-.2-3.9.9.9-3.8-.2-.4a10.2 10.2 0 1 1 9.2 5.2Zm5.7-7.6c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-.9 1.2-.3.2-.6.1a8.4 8.4 0 0 1-2.5-1.6 9.4 9.4 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6s-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.8-.8 2.1-1.5.3-.7.3-1.3.2-1.5-.2-.2-.4-.3-.7-.5Z" />
    </svg>
  );
}

function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

function phoneIsValid(phone: string) {
  const digits = onlyNumbers(phone);
  return digits.length >= 10 && digits.length <= 11;
}

function App() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => loadStoredSiteConfig());
  const isEditorRoute = typeof window !== "undefined" && (window.location.pathname === "/editor" || window.location.hash === "#editor");

  const [mode, setMode] = useState<Mode>("consumo");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [uf, setUf] = useState<UfKey>("SP");
  const [cityOptions, setCityOptions] = useState<string[]>(cidadesPorUf.SP);
  const [city, setCity] = useState("SÃƒÂ£o JoÃƒÂ£o da Boa Vista");
  const [otherCity, setOtherCity] = useState("");
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [roofType, setRoofType] = useState<RoofType>("CerÃƒÂ¢mica");
  const [tension, setTension] = useState<TensionType>("TrifÃƒÂ¡sico 220 V");
  const [monthlyConsumption, setMonthlyConsumption] = useState(700);
  const [installedPower, setInstalledPower] = useState(10);
  const [tariff, setTariff] = useState(CONFIG.defaultTariff);

  const hsp = hspPorUf[uf];
  const minimumAvailability = disponibilidadePorTensao[tension];
  const finalCity = city === "Outra cidade" ? otherCity.trim() : city;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(Number.isFinite(value) ? value : 0);

  const formatNumber = (value: number, digits = 0) =>
    new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(Number.isFinite(value) ? value : 0);

  const formatDecimal = (value: number, digits = 2) =>
    new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(Number.isFinite(value) ? value : 0);

  const result = useMemo(() => {
    const pr = Math.max(0.01, 1 - CONFIG.lossesPercent / 100);
    const safeConsumption = Math.max(0, Number(monthlyConsumption) || 0);
    const safePower = Math.max(0, Number(installedPower) || 0);
    const safeTariff = Math.max(0, Number(tariff) || 0);
    const targetEnergy = Math.max(0, safeConsumption - minimumAvailability);

    let theoreticalPower = 0;
    let modules = 0;
    let systemPower = 0;

    if (mode === "consumo") {
      theoreticalPower = hsp > 0 ? targetEnergy / (hsp * 30 * pr) : 0;
      modules = CONFIG.modulePowerWp > 0 ? Math.ceil((theoreticalPower * 1000) / CONFIG.modulePowerWp) : 0;
      systemPower = (modules * CONFIG.modulePowerWp) / 1000;
    } else {
      theoreticalPower = safePower;
      modules = CONFIG.modulePowerWp > 0 ? Math.ceil((safePower * 1000) / CONFIG.modulePowerWp) : 0;
      systemPower = (modules * CONFIG.modulePowerWp) / 1000;
    }

    const monthlyGeneration = systemPower * hsp * 30 * pr;
    const annualGeneration = monthlyGeneration * 12;
    const compensatedEnergy = mode === "consumo" ? Math.min(monthlyGeneration, targetEnergy) : monthlyGeneration;
    const monthlySavings = compensatedEnergy * safeTariff;
    const annualSavings = monthlySavings * 12;
    const investmentPower = mode === "potencia" ? safePower : systemPower;
    const investment = investmentPower * CONFIG.investmentPerKwpBeforeMultiplier * CONFIG.investmentMultiplier;
    const paybackMonths = monthlySavings > 0 ? investment / monthlySavings : 0;
    const paybackYears = paybackMonths / 12;
    const area = modules * CONFIG.areaPerModuleM2;

    const seasonalProfile = seasonalProfileByUf[uf] ?? seasonalProfileByUf.SP;
    const monthlyGenerationSeries = monthlyFactors.map((item, index) => ({
      ...item,
      factor: seasonalProfile[index] ?? 1,
      generation: systemPower * hsp * (seasonalProfile[index] ?? 1) * item.days * pr,
    }));

    const maxGeneration = Math.max(...monthlyGenerationSeries.map((item) => item.generation), 1);

    return {
      pr,
      targetEnergy,
      theoreticalPower,
      modules,
      systemPower,
      monthlyGeneration,
      annualGeneration,
      compensatedEnergy,
      monthlySavings,
      annualSavings,
      investment,
      paybackMonths,
      paybackYears,
      area,
      monthlyGenerationSeries,
      maxGeneration,
    };
  }, [mode, monthlyConsumption, installedPower, tariff, minimumAvailability, hsp, uf]);

  const validation = useMemo(() => {
    const errors: string[] = [];
    if (!name.trim()) errors.push("Informe seu nome.");
    if (!phoneIsValid(phone)) errors.push("Informe um telefone vÃƒÂ¡lido com DDD.");
    if (!finalCity) errors.push("Informe a cidade.");
    if (mode === "consumo" && monthlyConsumption <= 0) errors.push("Informe o consumo mÃƒÂ©dio mensal.");
    if (mode === "potencia" && installedPower <= 0) errors.push("Informe a potÃƒÂªncia instalada desejada.");
    if (tariff <= 0) errors.push("Informe a tarifa de energia.");
    return errors;
  }, [name, phone, finalCity, mode, monthlyConsumption, installedPower, tariff]);

  const summary = useMemo(() => {
    return `SimulaÃƒÂ§ÃƒÂ£o Fotovoltaica Renovera\nNome: ${name.trim() || "NÃƒÂ£o informado"}\nTelefone: ${phone || "NÃƒÂ£o informado"}\nCidade/UF: ${finalCity || "NÃƒÂ£o informado"}/${uf}\nTipo de telhado/local: ${roofType}\nTensÃƒÂ£o selecionada: ${tension}\nDisponibilidade mÃƒÂ­nima considerada: ${minimumAvailability} kWh\nModo: ${mode === "consumo" ? "Dimensionamento por consumo" : "Estimativa por potÃƒÂªncia instalada"}\nConsumo mÃƒÂ©dio informado: ${formatNumber(monthlyConsumption)} kWh/mÃƒÂªs\nPotÃƒÂªncia desejada informada: ${formatDecimal(installedPower)} kWp\nHSP mÃƒÂ©dia da UF: ${formatDecimal(hsp)} kWh/mÃ‚Â²/dia\nPerdas tÃƒÂ©cnicas internas consideradas: ${CONFIG.lossesPercent}%\nMÃƒÂ³dulo de referÃƒÂªncia: ${formatNumber(CONFIG.modulePowerWp)} Wp\nQuantidade de mÃƒÂ³dulos: ${formatNumber(result.modules)}\nPotÃƒÂªncia CC final: ${formatDecimal(result.systemPower)} kWp\nGeraÃƒÂ§ÃƒÂ£o mÃƒÂ©dia mensal: ${formatNumber(result.monthlyGeneration)} kWh/mÃƒÂªs\nGeraÃƒÂ§ÃƒÂ£o anual estimada: ${formatNumber(result.annualGeneration)} kWh/ano\nEconomia mensal estimada: ${formatCurrency(result.monthlySavings)}\nEconomia anual estimada: ${formatCurrency(result.annualSavings)}\nInvestimento estimado: ${formatCurrency(result.investment)}\nPayback simples: ${formatDecimal(result.paybackMonths, 1)} meses (${formatDecimal(result.paybackYears, 1)} anos)\nÃƒÂrea estimada: ${formatDecimal(result.area, 1)} mÃ‚Â²`;
  }, [name, phone, finalCity, uf, roofType, tension, minimumAvailability, mode, monthlyConsumption, installedPower, hsp, result]);

  if (isEditorRoute) {
    return <AdminEditor config={siteConfig} setConfig={setSiteConfig} />;
  }

  const whatsappNumber = onlyNumbers(siteConfig.whatsappNumber || WHATSAPP_NUMBER);
  const whatsappLink = buildWhatsappUrl(
    `OlÃƒÂ¡, Renovera. Gostaria de analisar minha conta de energia para dimensionar um sistema solar. Posso enviar minha fatura?\n\n${summary}`
  ).replace(WHATSAPP_NUMBER, whatsappNumber);
  const universalWhatsappLink = buildWhatsappUrl(
    "OlÃƒÂ¡, Renovera. Gostaria de receber uma anÃƒÂ¡lise tÃƒÂ©cnica pelo WhatsApp."
  ).replace(WHATSAPP_NUMBER, whatsappNumber);

  useEffect(() => {
    let cancelled = false;
    const fallbackCities = cidadesPorUf[uf];

    async function loadCitiesByUf() {
      setCitiesLoading(true);
      setCityOptions(fallbackCities);
      setCity(fallbackCities[0] ?? "Outra cidade");
      setOtherCity("");

      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
        );

        if (!response.ok) {
          throw new Error("Falha ao buscar cidades");
        }

        const data: Array<{ nome: string }> = await response.json();
        const ibgeCities = data
          .map((item) => item.nome)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b, "pt-BR"));

        const fullList = Array.from(new Set([...ibgeCities, "Outra cidade"]));

        if (!cancelled && fullList.length > 1) {
          setCityOptions(fullList);
          setCity(fullList[0]);
        }
      } catch {
        if (!cancelled) {
          setCityOptions(fallbackCities);
          setCity(fallbackCities[0] ?? "Outra cidade");
        }
      } finally {
        if (!cancelled) {
          setCitiesLoading(false);
        }
      }
    }

    loadCitiesByUf();

    return () => {
      cancelled = true;
    };
  }, [uf]);

  const handleUfChange = (value: UfKey) => {
    setUf(value);
  };

  const handleProtectedWhatsapp = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (validation.length > 0) {
      event.preventDefault();
      alert(validation.join("\n"));
    }
  };

  const copySummary = async () => {
    if (validation.length > 0) {
      alert(validation.join("\n"));
      return;
    }

    try {
      await navigator.clipboard.writeText(summary);
      alert("Resumo copiado para a ÃƒÂ¡rea de transferÃƒÂªncia.");
    } catch {
      alert("NÃƒÂ£o foi possÃƒÂ­vel copiar automaticamente. Selecione o resumo manualmente.");
    }
  };

  return (
    <div className="page" style={{ "--accent": siteConfig.visual.accentColor } as React.CSSProperties}>
      <header className="site-header">
        <div className="container nav">
          <a href="#top" className="brand" aria-label="Renovera">
            <img src={logoSrc} alt="Renovera" />
          </a>

          <nav className="nav-links" aria-label="Menu principal">
            <a href="#calculadora">Calculadora</a>
            <a href="#solucoes">SoluÃƒÂ§ÃƒÂµes</a>
            <a href="#processo">Processo</a>
            <a href="#duvidas">DÃƒÂºvidas</a>
          </nav>

          <a className="nav-cta" href="#calculadora">
            Solicitar anÃƒÂ¡lise
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero solar-hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="pill pill-dark">{siteConfig.hero.eyebrow}</div>

              <h1 style={{ fontSize: `calc(var(--hero-title-size) * ${siteConfig.visual.heroTitleSize})`, maxWidth: `${siteConfig.visual.heroMaxWidth}px` }}>{siteConfig.hero.title}</h1>

              <p className="hero-description">{siteConfig.hero.subtitle}</p>

              <div className="hero-actions">
                <a className="btn btn-primary" href="#calculadora">
                  {siteConfig.hero.primaryButton}
                </a>
                <a className="btn btn-secondary" href={whatsappLink} onClick={handleProtectedWhatsapp} target="_blank" rel="noreferrer">
                  {siteConfig.hero.secondaryButton}
                </a>
              </div>

              <div className="hero-chips">
                {siteConfig.hero.chips.map((chip) => (
                  <div className="hero-chip" key={`${chip.title}-${chip.description}`}>
                    <strong>{chip.title}</strong>
                    <span>{chip.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-panel-wrap solar-panel-wrap" aria-hidden="true">
              <div className="solar-dashboard refined-dashboard">
                <div className="hero-panel-top refined-top">
                  <span className="hero-os">Renovera Solar</span>
                  <span className="hero-expand">estudo preliminar</span>
                </div>

                <div className="hero-visual-scene solar-farm-art">
                  <div className="scene-sky-glow" />
                  <div className="scene-sun" />
                  <div className="scene-grid-line scene-grid-line-a" />
                  <div className="scene-grid-line scene-grid-line-b" />

                  <div className="solar-farm-field">
                    <div className="farm-panel-row row-a">
                      <span /><span /><span /><span />
                    </div>
                    <div className="farm-panel-row row-b">
                      <span /><span /><span /><span />
                    </div>
                    <div className="farm-panel-row row-c">
                      <span /><span /><span /><span />
                    </div>
                  </div>

                  <div className="inverter-tower">
                    <span className="tower-light" />
                    <strong>INV</strong>
                    <small>ON</small>
                  </div>

                  <div className="energy-path">
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="scene-energy-card farm-energy-card">
                    <small>Usina estimada</small>
                    <strong>{formatDecimal(result.systemPower)} kWp</strong>
                    <p>{formatNumber(result.modules)} mÃƒÂ³dulos Ã¢â‚¬Â¢ {formatNumber(result.monthlyGeneration)} kWh/mÃƒÂªs</p>
                  </div>

                  <div className="farm-savings-badge">
                    <small>Economia/mÃƒÂªs</small>
                    <strong>{formatCurrency(result.monthlySavings)}</strong>
                  </div>
                </div>

                <div className="solar-mini-grid refined-metrics hero-flow-row">
                  <div className="solar-metric">
                    <span>Conta de luz</span>
                    <strong>Ã¢â€ â€œ</strong>
                  </div>
                  <div className="solar-metric">
                    <span>Projeto FV</span>
                    <strong>Ã¢Å“â€œ</strong>
                  </div>
                </div>
              </div>

              <div className="hero-side-card solar-side-card refined-side-card">
                <div className="hero-side-icon">Ã¢â€ â€”</div>
                <small>Retorno simples</small>
                <strong>{formatDecimal(result.paybackYears, 1)} anos</strong>
                <p>considerando a economia mensal projetada</p>
              </div>
            </div>
          </div>
        </section>

        <section className="calculator-section" id="calculadora">
          <div className="container">
            <div className="section-head center">
              <div className="pill">{siteConfig.calculator.eyebrow}</div>
              <h2>{siteConfig.calculator.title}</h2>
              <p>{siteConfig.calculator.subtitle}</p>
            </div>

            <div className="mode-switch">
              <button className={mode === "consumo" ? "active" : ""} onClick={() => setMode("consumo")} type="button">
                Dimensionar por consumo
              </button>
              <button className={mode === "potencia" ? "active" : ""} onClick={() => setMode("potencia")} type="button">
                Estimar por potÃƒÂªncia
              </button>
            </div>

            <div className="calculator-box solar-calculator-box">
              <div className="calculator-left">
                <div className="calculator-title">
                  <div className="calculator-icon">Ã¢Ëœâ‚¬</div>
                  <div>
                    <h3>{siteConfig.calculator.formTitle}</h3>
                    <p>{siteConfig.calculator.formSubtitle}</p>
                  </div>
                </div>

                <div className="input-grid">
                  <div className="input-group">
                    <label>Nome</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
                  </div>

                  <div className="input-group">
                    <label>Telefone</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(19) 99999-9999" inputMode="tel" />
                  </div>

                  <div className="input-group">
                    <label>UF</label>
                    <select value={uf} onChange={(e) => handleUfChange(e.target.value as UfKey)}>
                      {(Object.keys(hspPorUf) as UfKey[]).map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Cidade</label>
                    <select value={city} onChange={(e) => setCity(e.target.value)} disabled={citiesLoading}>
                      {cityOptions.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                    <small>{citiesLoading ? "Carregando cidades da UF..." : "Lista de municÃƒÂ­pios filtrada pela UF selecionada."}</small>
                  </div>

                  {city === "Outra cidade" && (
                    <div className="input-group full">
                      <label>Informe a cidade</label>
                      <input value={otherCity} onChange={(e) => setOtherCity(e.target.value)} placeholder="Digite o nome da cidade" />
                    </div>
                  )}

                  {mode === "consumo" ? (
                    <div className="input-group">
                      <label>Consumo mÃƒÂ©dio mensal</label>
                      <input type="number" min={0} step={10} value={monthlyConsumption} onChange={(e) => setMonthlyConsumption(Number(e.target.value))} />
                      <small>kWh/mÃƒÂªs</small>
                    </div>
                  ) : (
                    <div className="input-group">
                      <label>PotÃƒÂªncia instalada desejada</label>
                      <input type="number" min={0} step={0.1} value={installedPower} onChange={(e) => setInstalledPower(Number(e.target.value))} />
                      <small>kWp</small>
                    </div>
                  )}

                  <div className="input-group">
                    <label>Tarifa de energia</label>
                    <input type="number" min={0} step={0.01} value={tariff} onChange={(e) => setTariff(Number(e.target.value))} />
                    <small>R$/kWh</small>
                  </div>

                  <div className="input-group">
                    <label>Tipo de telhado/local</label>
                    <select value={roofType} onChange={(e) => setRoofType(e.target.value as RoofType)}>
                      <option>CerÃƒÂ¢mica</option>
                      <option>Solo</option>
                      <option>Fibrocimento</option>
                      <option>MetÃƒÂ¡lico</option>
                      <option>Laje</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>TensÃƒÂ£o</label>
                    <select value={tension} onChange={(e) => setTension(e.target.value as TensionType)}>
                      <option>MonofÃƒÂ¡sico 220 V</option>
                      <option>TrifÃƒÂ¡sico 220 V</option>
                      <option>TrifÃƒÂ¡sico 380 V</option>
                    </select>
                    <small>Disponibilidade considerada: {minimumAvailability} kWh/mÃƒÂªs</small>
                  </div>
                </div>

                <div className="calculator-left-chart">
                <div className="generation-card input-generation-card">
                  <div className="generation-head">
                    <div>
                      <span>Curva anual estimada</span>
                      <strong>GeraÃƒÂ§ÃƒÂ£o mensal simulada</strong>
                    </div>
                    <small>mÃƒÂ¡x. {formatNumber(result.maxGeneration)} kWh</small>
                  </div>

                  <div className="generation-bars">
                    {result.monthlyGenerationSeries.map((item) => (
                      <div className="generation-bar-wrap" key={item.month} title={`${item.month}: ${formatNumber(item.generation)} kWh`}>
                        <div className="generation-bar" style={{ height: `${Math.max(12, (item.generation / result.maxGeneration) * 100)}%` }}>
                          <em>{formatNumber(item.generation)}</em>
                        </div>
                        <span>{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                </div>

                <div className="tariff-note compact-note">
                  <strong>{siteConfig.calculator.notePrefix}</strong> {siteConfig.calculator.noteText}
                </div>
              </div>

              <div className="calculator-right">
                <div className="result-grid">
                  <div className="result-card">
                    <span>POTÃƒÅ NCIA CC DO SISTEMA</span>
                    <strong>{formatDecimal(result.systemPower)} kWp</strong>
                    <p>PotÃƒÂªncia teÃƒÂ³rica: {formatDecimal(result.theoreticalPower)} kWp</p>
                  </div>

                  <div className="result-card">
                    <span>QUANTIDADE DE MÃƒâ€œDULOS</span>
                    <strong>{formatNumber(result.modules)}</strong>
                    <p>MÃƒÂ³dulos de {formatNumber(CONFIG.modulePowerWp)} Wp.</p>
                  </div>

                  <div className="result-card">
                    <span>GERAÃƒâ€¡ÃƒÆ’O MÃƒâ€°DIA MENSAL</span>
                    <strong>{formatNumber(result.monthlyGeneration)} kWh</strong>
                    <p>{formatNumber(result.annualGeneration)} kWh/ano estimados.</p>
                  </div>

                  <div className="result-card">
                    <span>ECONOMIA MENSAL</span>
                    <strong>{formatCurrency(result.monthlySavings)}</strong>
                    <p>{formatCurrency(result.annualSavings)} por ano.</p>
                  </div>

                  <div className="result-card">
                    <span>ÃƒÂREA ESTIMADA</span>
                    <strong>{formatDecimal(result.area, 1)} mÃ‚Â²</strong>
                    <p>ÃƒÂrea aproximada ocupada pelos mÃƒÂ³dulos.</p>
                  </div>

                  <div className="result-card">
                    <span>DISPONIBILIDADE</span>
                    <strong>{formatNumber(minimumAvailability)} kWh</strong>
                    <p>Calculada pela tensÃƒÂ£o selecionada.</p>
                  </div>
                </div>

                <div className="margin-card solar-payback-card">
                  <span>INVESTIMENTO E RETORNO</span>
                  <strong>{formatCurrency(result.investment)}</strong>
                  <p>
                    Payback simples estimado em {formatDecimal(result.paybackMonths, 1)} meses,
                    equivalente a {formatDecimal(result.paybackYears, 1)} anos, considerando economia mensal de {formatCurrency(result.monthlySavings)}.
                  </p>
                </div>



                <div className="summary-actions">
                  <a className="btn btn-secondary" href={whatsappLink} onClick={handleProtectedWhatsapp} target="_blank" rel="noreferrer">
                    Enviar simulaÃƒÂ§ÃƒÂ£o no WhatsApp
                  </a>
                  <button className="btn btn-outline" onClick={copySummary} type="button">
                    Copiar resumo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="applications-section" id="solucoes">
          <div className="container">
            <div className="section-head">
              <div className="pill">{siteConfig.applications.eyebrow}</div>
              <h2>{siteConfig.applications.title}</h2>
              <p>{siteConfig.applications.subtitle}</p>
            </div>

            <div className="applications-grid solar-applications">
              {siteConfig.applications.cards.map((card) => (
                <div className="app-card" key={card.title}>
                  <div className="app-icon">{card.icon}</div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="process-section" id="processo">
          <div className="container">
            <div className="section-head center compact">
              <div className="pill">{siteConfig.process.eyebrow}</div>
              <h2>{siteConfig.process.title}</h2>
              <p>{siteConfig.process.subtitle}</p>
            </div>

            <div className="method-grid">
              {siteConfig.process.steps.map((step) => (
                <div className="process-card" key={step.number}>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="faq-section" id="duvidas">
          <div className="container faq-split">
            <div className="faq-copy">
              <div className="pill">{siteConfig.faq.eyebrow}</div>
              <h2>{siteConfig.faq.title}</h2>
              <p>{siteConfig.faq.subtitle}</p>
            </div>

            <div className="faq-list">
              {siteConfig.faq.items.map((item) => (
                <FaqItem key={item.question} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        </section>

        <section className="development-section contact-section" id="contato">
          <div className="container">
            <div className="development-card contact-card">
              <div className="development-left">
                <div className="pill pill-dark small">{siteConfig.contact.eyebrow}</div>
                <h2>{siteConfig.contact.title}</h2>
                <p>{siteConfig.contact.subtitle}</p>
              </div>

              <div className="development-right contact-actions">
                <a className="btn btn-secondary" href={whatsappLink} onClick={handleProtectedWhatsapp} target="_blank" rel="noreferrer">
                  {siteConfig.contact.primaryButton}
                </a>
                <button className="btn btn-primary" onClick={copySummary} type="button">
                  {siteConfig.contact.secondaryButton}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <img src={logoSrc} alt="Renovera" />
            <p>{siteConfig.footer.description}</p>
          </div>

          <div className="footer-col">
            <h4>Menu</h4>
            <a href="#calculadora">Calculadora</a>
            <a href="#solucoes">SoluÃ§Ãµes</a>
            <a href="#processo">Processo</a>
            <a href="#duvidas">DÃºvidas</a>
          </div>

          <div className="footer-col">
            <h4>Contato</h4>
            <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
            <a href={whatsappLink} onClick={handleProtectedWhatsapp} target="_blank" rel="noreferrer">WhatsApp comercial</a>
          </div>

          <div className="footer-col">
            <h4>{siteConfig.footer.scopeTitle}</h4>
            <p>{siteConfig.footer.scopeText}</p>
          </div>

        </div>
        <div className="container footer-bottom">
          <span>{siteConfig.footer.copyright}</span>
        </div>
      </footer>

      {siteConfig.visual.showFloatingWhatsapp && (
        <a className="whatsapp-float" href={whatsappLink} onClick={handleProtectedWhatsapp} target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp">
          <WhatsAppIcon />
        </a>
      )}
    </div>
  );
}

export default App;
