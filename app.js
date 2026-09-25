const $ = (id) => document.getElementById(id);

function detectDevice() {
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const isAndroid = /Android/i.test(ua);
  const isSamsung = /SamsungBrowser/i.test(ua) || /SM-[A-Z0-9-]+/i.test(ua) || /Samsung/i.test(ua);
  const androidMatch = ua.match(/Android\s+([0-9.]+)/i);
  const browser = /SamsungBrowser\/([0-9.]+)/i.exec(ua);
  const standalone = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;

  const facts = [
    ["Plataforma", isAndroid ? "Android" : platform || "Desconhecida"],
    ["Samsung", isSamsung ? "Provável" : "Não identificado"],
    ["Android", androidMatch ? androidMatch[1] : "Não identificado"],
    ["Samsung Internet", browser ? browser[1] : "Não identificado"],
    ["Modo instalado", standalone ? "Standalone/PWA" : "Navegador"],
  ];

  $("deviceFacts").innerHTML = facts.map(([k, v]) =>
    `<div class="fact"><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>`
  ).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function chosen(id) {
  return $(id).value;
}

function diagnose() {
  const workProfile = chosen("workProfile");
  const agent = chosen("agent");
  const managed = chosen("managedMessage");
  const connected = chosen("connected");
  const fullyManaged = chosen("fullyManaged");

  const card = $("resultCard");
  card.hidden = false;

  let title = "Estado indeterminado";
  let body = "O navegador não consegue confirmar sozinho o estado Knox/MDM. Os sinais escolhidos apontam para um dos fluxos abaixo.";
  let tone = "neutral";
  let steps = [];

  if (workProfile === "yes") {
    title = "Provável Android Enterprise com Work Profile";
    tone = "green";
    body = "Quando o Knox Manage mostra a opção “Remove Work Profile only”, esse é o fluxo documentado para remover o perfil sem apagar o perfil pessoal.";
    steps = [
      "No Knox Manage, o administrador abre o dispositivo e escolhe Unenroll.",
      "Se a opção existir, selecionar “Remove Work Profile only”.",
      "O dispositivo não é factory reset nesse fluxo.",
      "Se o Agent estiver configurado para permitir pedidos do utilizador, o próprio dispositivo também pode apresentar uma opção de unenrollment."
    ];
  } else if (connected === "no" && agent === "yes") {
    title = "Provável dispositivo desconectado com Knox Manage Agent";
    tone = "yellow";
    body = "O fluxo documentado para um dispositivo que não consegue contactar o servidor é o Offline Unenrollment Code.";
    steps = [
      "O administrador abre o dispositivo no Knox Manage e seleciona Unenroll/Force Unenroll.",
      "O administrador copia o Offline Unenrollment Code.",
      "No telefone: Knox Manage Agent → Settings → Offline Unenrollment.",
      "Introduzir o código e tocar em End."
    ];
  } else if (fullyManaged === "yes") {
    title = "Provável dispositivo totalmente gerido";
    tone = "red";
    body = "Em dispositivos totalmente geridos, o método de unenrollment depende da configuração. A documentação atual do Knox Manage indica que o fluxo normal pode terminar em factory reset.";
    steps = [
      "O administrador deve iniciar o Unenroll Device no Knox Manage.",
      "Se o aparelho tiver sido provisionado por Knox Mobile Enrollment, confirmar também a situação do perfil KME.",
      "Não assumir que uma reposição de fábrica remove o enrollment empresarial: um perfil KME ainda associado pode voltar a provisionar o dispositivo.",
      "Se o dispositivo estiver desconectado, usar o Offline Unenrollment Code no Agent."
    ];
  } else if (managed === "yes" && agent === "yes" && connected === "yes") {
    title = "Knox Manage parece ativo e conectado";
    tone = "blue";
    body = "O fluxo típico é o administrador enviar Unenroll Device. Se a política permitir pedido do utilizador, o Agent pode disponibilizar o pedido de unenrollment.";
    steps = [
      "Verificar no Agent as opções em Settings.",
      "Se existir pedido de unenrollment, seguir o fluxo apresentado pelo Agent.",
      "Caso contrário, o administrador deve enviar Unenroll Device a partir do Knox Manage.",
      "Se a opção de remoção pelo utilizador não estiver disponível, a política administrativa está a bloquear esse caminho."
    ];
  } else {
    steps = [
      "Abrir o Knox Manage Agent e consultar Settings.",
      "Procurar a secção Offline Unenrollment.",
      "Verificar se existe Work Profile no ecrã de contas/perfis Android.",
      "Se houver bloqueio de gestão no arranque, considerar que o aparelho pode estar sujeito a Android Enterprise/KME e requerer ação no console administrativo."
    ];
  }

  $("status").className = `status ${tone}`;
  $("status").textContent = tone === "green" ? "Sinal forte" :
                            tone === "yellow" ? "Fluxo offline" :
                            tone === "red" ? "Gestão total" :
                            tone === "blue" ? "Gestão conectada" : "Diagnóstico";
  $("resultTitle").textContent = title;
  $("resultBody").textContent = body;
  $("steps").innerHTML = `<ol>${steps.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ol>`;
}

$("diagnose").addEventListener("click", diagnose);
$("refresh").addEventListener("click", detectDevice);

$("openAgent").addEventListener("click", () => {
  // Android browsers may or may not honor package intents. A normal HTTPS
  // fallback is shown by the browser if the package is not installed.
  const intentUrl =
    "intent://#Intent;scheme=knoxmanage;package=com.sds.emm.cloud.knox.samsung;end";
  window.location.href = intentUrl;
});

detectDevice();
