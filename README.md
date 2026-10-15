# Juicers

Aplicação web desenvolvida como projeto de challenge da FIAP (1º ano) para monitoramento de saúde voltado a usuários que fazem uso de esteroides anabolizantes. O sistema permite acompanhar marcadores laboratoriais, visualizar alertas de risco por sistema orgânico e simular o impacto de compostos no organismo.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 19 |
| Bundler | Vite 8 |
| Roteamento | React Router DOM 7 |
| Gráficos | Recharts 3 |
| Estilização | CSS modular por componente + Bootstrap 5 |
| Linting | ESLint 9 |

---

## Time

| Nome | Papel |
|---|---|
| Jefferson Gomes | Pesquisa científica, validação médica e organização dos dados de saúde |
| Natalia Lugão | Frontend / UI-UX — construção visual e experiência do usuário |
| Sophia Coelho | Criação dos gráficos interativos e visualização dos dados de saúde |
| Gabriel Soares | Análises de risco, cálculos e regras que processam os dados de saúde do sistema |
| André Melo | Processo criativo do projeto, construção do pitch e apresentação da proposta |

---

## Arquitetura

```
src/
├── App.jsx                  # Configuração de rotas e providers globais
├── main.jsx                 # Entrypoint
├── pages/                   # Páginas (uma por rota)
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Perfil.jsx
│   └── Sobre.jsx
├── components/              # Componentes reutilizáveis e seções
│   ├── Navbar.jsx / Footer.jsx / Topbar.jsx / Layout.jsx
│   ├── inicio/              # Seção hero da Home
│   ├── painel/              # Painel de visão geral na Home
│   ├── mapaCorporal/        # Mapa corporal interativo (HumanBody)
│   ├── simulador/           # Simulador de compostos e riscos
│   ├── perfilDoUsuario/     # Cards de métricas, gráficos e alertas do Perfil
│   │   └── graficos/        # Gráficos por sistema (Recharts)
│   ├── sobreProjeto/        # Contextualização, time e stacks
│   ├── Acessibilidade/      # Menu e botões de acessibilidade
│   ├── LeitorDeAudio/       # Leitor de áudio (screen reader próprio)
│   ├── DadosContaAtleta.jsx # Formulário de dados pessoais autenticado
│   ├── HistoricoExames.jsx  # Listagem cronológica de exames
│   └── OnboardingForm.jsx   # Formulário de onboarding inicial
└── style/                   # Arquivos CSS individuais por componente
```

**Persistência:** contas, perfis, exames e comunicação são armazenados no MongoDB. O frontend mantém a sessão em cookie HttpOnly emitido pela API e os dados carregados em memória. Dados clínicos e tokens não são persistidos no localStorage. PDFs importados a partir desta versão são guardados no próprio documento do exame, com projeção desabilitada nas consultas comuns, e servidos apenas por rotas autenticadas e restritas ao paciente ou médico atualmente vinculado. São excluídos junto com o exame ou a conta.

---

## Fluxo de Navegação

```
/ (Home)
├── Início       — hero com apresentação do produto
├── Painel       — visão geral dos principais indicadores
├── Mapa Corporal — corpo humano interativo com sistemas de risco
└── Simulador    — simulação de efeitos de compostos

/sobre
├── Contextualização — problema e proposta
├── Time             — membros do projeto
└── Stacks Usadas    — tecnologias

/login           — autenticação do usuário

/perfil          — dashboard individual
├── Topbar           — identificação e resumo do ciclo
├── Dados da Conta   — accordion com formulário editável
├── Métricas         — cards com testosterona, LDL, TGO/TGP, HDL
├── Gráfico          — evolução temporal por sistema orgânico
├── Alertas / Exames / Insights — painel lateral
└── Histórico de Exames — linha do tempo completa

/conta           — edição isolada dos dados da conta
```

Componentes de acessibilidade (`AccessibilityMenu` e `LeitorDeAudio`) são montados globalmente no `App.jsx` e ficam disponíveis em todas as rotas.

---

## Como rodar

```bash
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173` por padrão.

Em outro terminal, execute `npm install` e `npm run dev` na pasta `backend`, com as variáveis configuradas conforme descrito abaixo. O Vite encaminha `/api` para o backend local.

## Verificação e operação

Execute `npm run check` na raiz para rodar lint, testes e build. O workflow `.github/workflows/checks.yml` executa a mesma verificação em pushes e pull requests. Os testes usam fixtures e mocks: não excluem contas nem alteram os pacientes do Atlas.

Sessões duram até sete dias. Logout e troca de senha revogam sessões anteriores. A mudança para cookies exige novo login em clientes que usavam tokens no localStorage. Em produção, mantenha HTTPS e `NODE_ENV=production`, `JWT_SECRET` e `FRONTEND_URL` corretamente configurados.

Na tela de dados da conta, o paciente pode exportar seus dados ou excluir a conta e os registros vinculados. A exclusão exige confirmação e autenticação recente ou senha. Exclusões e alterações relacionadas usam transações; o banco precisa ser um replica set, como o Atlas. Se a transação falhar, a API retorna erro sem confirmar uma gravação parcial.

Uploads aceitam PDFs de até 5 MB com texto extraível, data válida e indicadores reconhecidos. PDFs digitalizados sem texto não passam pela importação. Datas, unidades e valores são validados no servidor; as classificações usam as faixas configuradas na plataforma e não substituem avaliação clínica. Reenvios do mesmo PDF para o mesmo paciente reaproveitam o exame existente.

O histórico oferece visualização e download do PDF original. Exames antigos sem arquivo guardado precisam de reenvio. Quando existe o hash do upload anterior, o reenvio anexa o PDF ao mesmo exame. O JSON de exportação contém os dados dos exames, sem os arquivos binários; os PDFs podem ser baixados individualmente no histórico. No Atlas Free, esses arquivos consomem a capacidade de armazenamento do cluster; monitore o espaço disponível.

### Backup — pendência de infraestrutura

Na conferência de 14/10/2026, o cluster Juicers estava no Atlas Free, AWS São Paulo (`sa-east-1`), sem backup automático ativo. A responsável decidiu manter o plano gratuito por enquanto; a proposta de upgrade foi descartada sem alterar o cluster. Caso seja reavaliada, a opção Flex inclui snapshots diários, mantidos por oito dias, com primeiro snapshot em até 24 horas, e requer aprovação de custo e da janela de indisponibilidade.

Após habilitar backup, atualize a política de privacidade com a retenção real. Para validar restauração, use um cluster isolado, verifique integridade e contagens sem expor dados, e reaplique exclusões ocorridas após o snapshot antes de usar uma restauração em produção. A restauração ainda não foi testada. Nunca restaure por cima do cluster ativo sem uma janela e um plano de retorno definidos.

---

## Verificação do CRM no cadastro médico

O cadastro de médicos consulta o Web Service oficial do Conselho Federal de Medicina. O backend confirma que a inscrição está **Regular** e valida que CRM, UF, CPF e data de nascimento correspondem ao mesmo médico. CPF e data de nascimento são encaminhados ao CFM durante a verificação e não são persistidos pela aplicação. O perfil médico e suas rotas protegidas só são liberados após a confirmação.

Contas médicas criadas antes dessa integração podem ser preservadas: ao tentar entrar, o médico é encaminhado para uma etapa de revalidação. Após a conferência pelo CFM, o sistema atualiza o registro médico existente e mantém a mesma conta, senha, pacientes e dados já cadastrados.

### Modo local de apresentação sem licença CFM

Para apresentações sem integração ao CFM, é possível liberar **somente contas médicas já existentes** no banco que também tenham um perfil em `doctors`. Localmente, no `.env` do backend, use `NODE_ENV=development` e `ALLOW_LEGACY_DOCTOR_DEMO=true`. Em uma implantação de demonstração, configure `LEGACY_DOCTOR_DEMO_EMAILS` com os e-mails exatos autorizados, separados por vírgula. A lista só afeta contas existentes com perfil médico e sem verificação CFM; não permite criar novas contas médicas sem verificação. Esse modo não verifica nem afirma que o CRM está ativo; o painel exibe um aviso de demonstração.

Para habilitar a integração, configure no ambiente do backend:

```env
MONGO_URI=mongodb://...
JWT_SECRET=seu-segredo-jwt
CFM_ACCESS_KEY=chave-fornecida-pelo-cfm
```

Copie `backend/.env.example` para `backend/.env` e preencha os valores antes de iniciar o servidor local na pasta `backend`.

O login Google para pacientes usa um ID de cliente OAuth do tipo **Aplicativo da Web**. No `.env` da raiz, configure `VITE_GOOGLE_CLIENT_ID`; em `backend/.env`, configure `GOOGLE_CLIENT_ID` com o mesmo ID. No Console do Google Cloud, autorize as origens JavaScript `http://localhost:5173` e `https://juicers-next.vercel.app`. Se a tela de consentimento estiver em modo de teste, adicione os e-mails que farão a apresentação como usuários de teste. O backend valida o ID token do Google e só vincula contas existentes com e-mail Google verificado e confiável; contas médicas continuam usando o login atual.

### Deploy da API junto com o site na Vercel

O frontend chama a API pelo mesmo domínio (`/api`). A Vercel publica o Express como uma função a partir de `api/index.js`, então a API não precisa de um domínio separado. No projeto `juicers-next`, configure nas variáveis de ambiente da Vercel:

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=um-segredo-longo-e-aleatorio
FRONTEND_URL=https://juicers-next.vercel.app
GOOGLE_CLIENT_ID=seu-id-de-cliente-oauth
VITE_GOOGLE_CLIENT_ID=seu-id-de-cliente-oauth
```

Para cadastrar médicos, configure também `CFM_ACCESS_KEY`. Para habilitar a exceção temporária de médicos legados, configure `ALLOW_LEGACY_DOCTOR_DEMO=true` e `LEGACY_DOCTOR_DEMO_EMAILS` com os e-mails autorizados. Para enviar convites por e-mail, configure `GMAIL_USER` com uma conta `@gmail.com` remetente e `GMAIL_APP_PASSWORD` com uma senha de app do Google. Não use a senha normal do Gmail. O ID OAuth não é segredo, mas mantenha o Client ID do backend e o `VITE_` iguais. Depois de adicionar ou alterar variáveis, faça um novo deploy na Vercel.

Os links de convite expiram em 7 dias. Se o SMTP não estiver configurado ou o envio falhar, o convite ainda é criado e a tela informa que o link precisa ser compartilhado manualmente.

Sem `CFM_ACCESS_KEY`, o cadastro de médico falha de forma fechada; cadastros de pacientes continuam disponíveis. A chave deve permanecer somente no servidor e nunca ser incluída no frontend.

O CFM exige que a própria pessoa jurídica usuária solicite acesso ao Web Service, assine o termo aplicável e receba uma chave válida. Consulte as regras, finalidade de uso e valores vigentes diretamente no [CFM](https://sistemas.cfm.org.br/listamedicos/informacoes). Não use a chave de outra organização nem publique os dados consultados.

Referências oficiais: [Web Service de consulta de médicos](https://sistemas.cfm.org.br/listamedicos/informacoes), [especificação técnica SOAP](https://sistemas.cfm.org.br/listamedicos/arquivos/manualwebservices.pdf) e [Resolução CFM nº 2.309/2022](https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2022/2309_2022.pdf).
