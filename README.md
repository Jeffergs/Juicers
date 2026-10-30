<div align="center">

<img width="250" alt="Logo da Juicers" src="./src/assets/juicers1.png" /> 

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&color=00E3F0&multiline=true&width=800&lines=Sa%C3%BAde+e+redu%C3%A7%C3%A3o+de+danos+para+usu%C3%A1rios+de+esteroides+anabolizantes)](https://git.io/typing-svg)
Plataforma de monitoramento de saúde e redução de danos para pessoas que utilizam esteroides anabolizantes



<p>
🌐 <strong>Deploy:</strong> https://juicers-next.vercel.app/
<p>🎥 <strong>Pitch:</strong> <a href="https://www.youtube.com/watch?v=7a0OCLeTvXU" style="color:#f57c00;">Assista aqui</a></p>
</p>

</div>





------------------------------------------------------------------------

## 📑 Índice

1.  [📝 Contexto do desafio](#contexto-do-desafio)
2.  [🎯 Objetivo do projeto](#objetivo-do-projeto)
3.  [🌍 Sobre o Juicers](#sobre-o-juicers)
4.  [🚨 Problema](#problema)
5.  [💡 Solução proposta](#solução-proposta)
6.  [🧩 Funcionalidades](#funcionalidades)
7.  [📈 Impacto e responsabilidade](#impacto-e-responsabilidade)
8.  [💻 Tecnologias utilizadas](#tecnologias-utilizadas)
9.  [🗺️ Fluxo de navegação](#fluxo-de-navegação)
10. [📂 Arquitetura do projeto](#arquitetura-do-projeto)
11. [🔐 Segurança e persistência](#segurança-e-persistência)
12. [🚀 Como executar localmente](#como-executar-localmente)
13. [⚙️ Configuração do ambiente](#configuração-do-ambiente)
14. [🧪 Verificações e testes](#verificações-e-testes)
15. [🩺 Integração com o CFM](#integração-com-o-cfm)
16. [⚠️ Limitações e cuidados](#limitações-e-cuidados)
17. [👥 Equipe](#equipe)
18. [📚 Referências](#referências)

------------------------------------------------------------------------

`<a id="contexto-do-desafio">`{=html}`</a>`{=html} \## 📝 Contexto do
desafio

O **Juicers** foi desenvolvido como projeto acadêmico da FIAP, no
contexto de um desafio voltado à criação de uma solução digital para uma
questão real de saúde. A proposta aborda a redução de danos para pessoas
que fazem uso de esteroides anabolizantes, com foco na organização de
informações e no acompanhamento de indicadores laboratoriais.

O projeto contou com parceria da **THM Estatística** e orientação de
mentores durante seu desenvolvimento.

------------------------------------------------------------------------

`<a id="objetivo-do-projeto">`{=html}`</a>`{=html} \## 🎯 Objetivo do
projeto

Desenvolver uma aplicação web que reúna informações relevantes para o
acompanhamento de saúde, permitindo que o usuário visualize indicadores
laboratoriais, acompanhe sua evolução ao longo do tempo e compreenda
alertas associados a diferentes sistemas orgânicos.

A plataforma foi concebida como ferramenta de apoio à organização e à
compreensão de dados, sem substituir o acompanhamento de profissionais
de saúde.

------------------------------------------------------------------------

`<a id="sobre-o-juicers">`{=html}`</a>`{=html} \## 🌍 Sobre o Juicers

O **Juicers** é uma plataforma web voltada à redução de danos para
pessoas que utilizam esteroides anabolizantes. A aplicação organiza
dados de saúde em uma interface com painéis, gráficos, histórico de
exames e alertas por sistema orgânico.

A proposta combina:

-   🧪 **Monitoramento laboratorial:** organização de marcadores e
    resultados de exames.
-   📊 **Visualização de dados:** gráficos para acompanhar indicadores
    ao longo do tempo.
-   🚦 **Alertas de risco:** classificações baseadas nas faixas
    configuradas na plataforma.
-   🧍 **Mapa corporal interativo:** visualização de sistemas orgânicos
    associados aos indicadores.
-   🧮 **Simulador de compostos:** experiência demonstrativa para
    explorar possíveis efeitos e riscos.
-   ♿ **Acessibilidade:** recursos de acessibilidade e leitura de
    conteúdo por áudio.

------------------------------------------------------------------------

`<a id="problema">`{=html}`</a>`{=html} \## 🚨 Problema

O uso de esteroides anabolizantes pode envolver riscos à saúde, enquanto
a interpretação de indicadores laboratoriais e o acompanhamento de
alterações ao longo do tempo exigem informação organizada e, quando
necessário, avaliação profissional.

Quando resultados de exames ficam dispersos, torna-se mais difícil
visualizar tendências, manter um histórico organizado e identificar
quais informações precisam ser discutidas com um profissional de saúde.

O Juicers busca tornar esses dados mais acessíveis e compreensíveis por
meio de uma experiência digital centralizada.

------------------------------------------------------------------------

`<a id="solução-proposta">`{=html}`</a>`{=html} \## 💡 Solução proposta

O Juicers reúne dados de conta, informações de saúde e exames em uma
plataforma com acesso autenticado. Os indicadores são apresentados em
painéis e gráficos, enquanto alertas e classificações ajudam o usuário a
organizar informações que podem precisar de acompanhamento.

### Como funciona

1.  O usuário acessa a plataforma e realiza a autenticação.
2.  Preenche ou atualiza os dados solicitados para seu perfil.
3.  Consulta indicadores e visualizações disponíveis no painel.
4.  Acompanha a evolução dos resultados e o histórico de exames.
5.  Utiliza recursos interativos para explorar as informações
    apresentadas.

A aplicação também oferece importação de exames em PDF, desde que os
arquivos atendam aos critérios de validação implementados.

------------------------------------------------------------------------

`<a id="funcionalidades">`{=html}`</a>`{=html} \## 🧩 Funcionalidades

### 🏠 Página inicial e painel

-   Apresentação da proposta do Juicers.
-   Visão geral dos principais indicadores.
-   Mapa corporal interativo.
-   Acesso ao simulador de compostos e riscos.

### 👤 Perfil e acompanhamento

-   Painel individual com dados da conta.
-   Cards de indicadores, incluindo testosterona, LDL, TGO/TGP e HDL.
-   Gráficos de evolução temporal por sistema orgânico.
-   Alertas, exames e insights apresentados na interface.
-   Histórico cronológico de exames.
-   Edição dos dados da conta.

### 📄 Importação e histórico de exames

-   Upload de arquivos PDF de até 5 MB com texto extraível.
-   Validação, no servidor, de datas, unidades e indicadores
    reconhecidos.
-   Visualização e download do PDF original por rotas autenticadas.
-   Reaproveitamento de exames existentes em reenvios reconhecidos para
    o mesmo paciente.
-   Exportação dos dados da conta e dos exames em JSON, sem incluir os
    arquivos PDF binários.

PDFs digitalizados sem texto extraível não são aceitos pelo fluxo de
importação descrito nesta versão.

### 🧮 Simulador interativo

-   Interface para explorar a simulação de compostos e riscos.
-   Apresentação visual de informações relacionadas aos efeitos
    simulados.
-   Recurso educativo e demonstrativo; não constitui previsão clínica
    individual.

### ♿ Acessibilidade

-   Menu e controles de acessibilidade disponíveis globalmente.
-   Leitor de áudio para conteúdo da aplicação.
-   Recursos disponíveis nas diferentes rotas.

### 🔐 Contas e autenticação

-   Autenticação de usuários.
-   Sessão mantida por cookie `HttpOnly` emitido pela API.
-   Login Google para pacientes, quando configurado.
-   Fluxos específicos de validação para contas médicas.

------------------------------------------------------------------------

`<a id="impacto-e-responsabilidade">`{=html}`</a>`{=html} \## 📈 Impacto
e responsabilidade

### 🧪 Organização de informações

Centraliza indicadores e resultados de exames para facilitar a consulta
e o acompanhamento ao longo do tempo.

### 📊 Compreensão dos dados

Gráficos, painéis e mapa corporal interativo ajudam a apresentar
informações de saúde em formato visual.

### 🛡️ Redução de danos

A proposta é apoiar a organização e a conscientização sobre informações
relacionadas à saúde, incentivando que dúvidas e alterações sejam
discutidas com profissionais qualificados.

> **Importante:** as classificações exibidas dependem das faixas
> configuradas na plataforma e não substituem diagnóstico, orientação
> médica ou avaliação clínica individual.

------------------------------------------------------------------------

## 💻 Tecnologias utilizadas

### Frontend
<div>
&nbsp <img width="20" height="20" alt="React 19" src="https://github.com/user-attachments/assets/6188ab74-3abf-4347-8b82-295a49e375ab" /> &nbsp; <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">React 19</a> - Construção da interface por componentes
<br>
&nbsp <img width="20" height="20" alt="React-Router" src="https://cdn.svglogos.dev/logos/react-router.svg" /> &nbsp; <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">React Router</a> - Roteamento entre páginas
<br>
&nbsp <img width="20" height="20" alt="Javascript" src="https://github.com/user-attachments/assets/035a2d94-4ddc-4673-92c7-35bf18e3f965" /> &nbsp; <a href="https://developer.mozilla.org/pt-BR/docs/Web/JavaScript" target="_blank" rel="noopener noreferrer"> JavaScript</a> - Lógica da aplicação
<br>
&nbsp <img width="20" height="20" alt="Vite" src="https://github.com/user-attachments/assets/c8f05793-3230-4dea-b41c-a219cf033689" /> &nbsp; <a href="https://developer.mozilla.org/pt-BR/docs/Web/JavaScript" target="_blank" rel="noopener noreferrer"> Vite</a> - Ambiente de desenvolvimento e build
</div>
<div>
&nbsp <img width="20" height="20" alt="CSS 3" src="https://github.com/user-attachments/assets/dc7b892c-b557-4f37-8bd8-275574743dde" /> &nbsp; <a href="https://developer.mozilla.org/pt-BR/docs/Web/CSS" target="_blank" rel="noopener noreferrer">CSS 3</a>
<br>
&nbsp <img width="20" height="20"  alt="bootstrap" src="https://github.com/user-attachments/assets/b2efa926-4a9e-4fa8-b59f-92240e152954" /> &nbsp; <a href="https://getbootstrap.com/" target="_blank" rel="noopener noreferrer">Bootstrap 5.3</a> - Recursos de layout e interface   
<br>
&nbsp <img width="20" height="20" alt="image" src="https://github.com/user-attachments/assets/6c9ccd81-3aef-4fd7-b1f1-5b892837e880" /> &nbsp; <a href="https://lucide.dev/" target="_blank" rel="noopener noreferrer">Lucide React</a>
</div>

<img width="40" height="40" alt="mongo-db" src="https://cdn.svglogos.dev/logos/mongodb-icon.svg" />


  [Vite 8](https://vite.dev/)                                             

  [JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)   

  [React Router DOM 7](https://reactrouter.com/)                          

  [Recharts 3](https://recharts.org/)                                     Gráficos e visualização de
                                                                          indicadores

  [CSS modular](https://developer.mozilla.org/pt-BR/docs/Web/CSS)         Estilização dos componentes            

  [ESLint 9](https://eslint.org/)                                         Análise estática e padronização do
                                                                          código

### Backend e persistência

  

  Node.js                             Ambiente de execução do backend

  Express                             API utilizada pela aplicação

  MongoDB                             Persistência de contas, perfis e
                                      exames

  JWT                                 Base das operações de autenticação

  Cookies `HttpOnly`                  Manutenção da sessão no navegador

  Google OAuth                        Autenticação Google para pacientes,
                                      quando configurada

  Web Service do CFM                  Verificação de inscrição médica,
                                      quando configurada
  -----------------------------------------------------------------------

------------------------------------------------------------------------

`<a id="fluxo-de-navegação">`{=html}`</a>`{=html} \## 🗺️ Fluxo de
navegação

``` text
/ (Home)
├── Início             — apresentação do produto
├── Painel             — visão geral dos indicadores
├── Mapa corporal      — visualização interativa de sistemas orgânicos
└── Simulador          — simulação de compostos e riscos

/sobre                 — contexto, proposta, equipe e tecnologias
/login                 — autenticação

/perfil                — painel individual
├── Dados da conta     — consulta e edição de dados
├── Métricas           — indicadores de saúde
├── Gráficos           — evolução temporal
├── Alertas e exames   — informações apresentadas pela plataforma
└── Histórico          — linha do tempo dos exames

/conta                 — edição isolada dos dados da conta
```

Os componentes de acessibilidade são montados globalmente no `App.jsx` e
ficam disponíveis nas rotas da aplicação.

------------------------------------------------------------------------

`<a id="arquitetura-do-projeto">`{=html}`</a>`{=html} \## 📂 Arquitetura
do projeto

### Frontend

``` text
src/
├── App.jsx                  # Configuração de rotas e providers globais
├── main.jsx                 # Ponto de entrada da aplicação
├── pages/                   # Páginas associadas às rotas
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Perfil.jsx
│   └── Sobre.jsx
├── components/              # Componentes reutilizáveis e seções
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── Topbar.jsx
│   ├── Layout.jsx
│   ├── inicio/
│   ├── painel/
│   ├── mapaCorporal/
│   ├── simulador/
│   ├── perfilDoUsuario/
│   │   └── graficos/
│   ├── sobreProjeto/
│   ├── Acessibilidade/
│   ├── LeitorDeAudio/
│   ├── DadosContaAtleta.jsx
│   ├── HistoricoExames.jsx
│   └── OnboardingForm.jsx
└── style/                   # Estilos individuais dos componentes
```

O backend fica na pasta `backend/`. A aplicação também publica a API por
meio de `api/index.js` no deploy da Vercel.

------------------------------------------------------------------------

`<a id="segurança-e-persistência">`{=html}`</a>`{=html} \## 🔐 Segurança
e persistência

A aplicação utiliza MongoDB para armazenar contas, perfis e exames. O
frontend mantém a sessão em cookie `HttpOnly` emitido pela API; dados
clínicos e tokens não são persistidos no `localStorage`.

Outros cuidados implementados:

-   Rotas autenticadas para acessar PDFs de exames.
-   Acesso aos arquivos restrito ao paciente ou ao médico atualmente
    vinculado.
-   Exclusão dos PDFs junto com o exame ou a conta correspondente.
-   Revogação de sessões anteriores em operações de logout e troca de
    senha.
-   Operações relacionadas de exclusão e alteração protegidas por
    transações.
-   Validação no servidor dos dados extraídos dos PDFs.
-   Verificação da identidade médica por integração com o CFM, quando
    habilitada.

A aplicação requer configuração segura das variáveis de ambiente. Em
produção, utilize HTTPS e mantenha segredos exclusivamente no backend.

------------------------------------------------------------------------

`<a id="como-executar-localmente">`{=html}`</a>`{=html} \## 🚀 Como
executar localmente

### Pré-requisitos

-   Node.js e npm instalados.
-   MongoDB acessível para o backend.
-   Git instalado.

### 1. Clonar o repositório

``` bash
git clone https://github.com/Jeffergs/Juicers.git
cd Juicers
```

### 2. Instalar as dependências do frontend

Na raiz do projeto:

``` bash
npm install
```

### 3. Configurar o backend

Copie o arquivo de exemplo de variáveis de ambiente:

``` bash
cp backend/.env.example backend/.env
```

Preencha as variáveis necessárias conforme a seção [Configuração do
ambiente](#configuração-do-ambiente).

### 4. Iniciar o backend

Em um terminal:

``` bash
cd backend
npm install
npm run dev
```

O comando de desenvolvimento disponível pode variar conforme os scripts
definidos no `package.json` do backend.

### 5. Iniciar o frontend

Em outro terminal, na raiz do projeto:

``` bash
npm run dev
```

Por padrão, o frontend fica disponível em:

``` text
http://localhost:5173
```

O Vite encaminha as requisições de `/api` para o backend local, conforme
a configuração do projeto.

------------------------------------------------------------------------

`<a id="configuração-do-ambiente">`{=html}`</a>`{=html} \## ⚙️
Configuração do ambiente

### Backend

Copie `backend/.env.example` para `backend/.env` e configure os valores
aplicáveis:

``` env
MONGO_URI=mongodb://...
JWT_SECRET=seu-segredo-jwt
FRONTEND_URL=http://localhost:5173
```

Para habilitar funcionalidades adicionais, podem ser necessárias outras
variáveis:

``` env
CFM_ACCESS_KEY=chave-fornecida-pelo-CFM
GOOGLE_CLIENT_ID=seu-id-de-cliente-oauth
GMAIL_USER=conta-remetente@gmail.com
GMAIL_APP_PASSWORD=senha-de-app-do-google
```

-   `MONGO_URI`: conexão com o MongoDB.
-   `JWT_SECRET`: segredo usado pelo backend para operações relacionadas
    à autenticação.
-   `FRONTEND_URL`: origem do frontend autorizada pela API.
-   `CFM_ACCESS_KEY`: chave necessária para a integração de verificação
    médica pelo CFM.
-   `GOOGLE_CLIENT_ID`: ID OAuth utilizado pelo backend para validar o
    login Google.
-   `GMAIL_USER` e `GMAIL_APP_PASSWORD`: configuração de envio de
    convites por e-mail, quando utilizada.

Nunca publique arquivos `.env`, chaves de integração ou senhas. Para o
envio por Gmail, utilize uma senha de app, não a senha normal da conta.

### Login Google para pacientes

Configure `VITE_GOOGLE_CLIENT_ID` no `.env` da raiz e `GOOGLE_CLIENT_ID`
no `backend/.env` com o mesmo ID de cliente OAuth do tipo **Aplicativo
da Web**.

No Google Cloud Console, autorize as origens locais e de produção
utilizadas pela aplicação. O backend valida o ID token e limita o
vínculo às contas elegíveis conforme as regras implementadas.

### Deploy na Vercel

O frontend chama a API pelo mesmo domínio (`/api`). No deploy descrito
pelo projeto, a Vercel publica o Express como uma função a partir de
`api/index.js`.

Configure no projeto da Vercel as variáveis de ambiente necessárias para
o ambiente de produção, incluindo `MONGO_URI`, `JWT_SECRET`,
`FRONTEND_URL`, `GOOGLE_CLIENT_ID` e `VITE_GOOGLE_CLIENT_ID`. Configure
`CFM_ACCESS_KEY` se o cadastro de médicos com verificação CFM estiver
habilitado.

Depois de adicionar ou alterar variáveis de ambiente, faça um novo
deploy.

------------------------------------------------------------------------

`<a id="verificações-e-testes">`{=html}`</a>`{=html} \## 🧪 Verificações
e testes

Na raiz do projeto, execute:

``` bash
npm run check
```

Esse comando reúne as verificações de lint, testes e build. O workflow
`.github/workflows/checks.yml` executa a mesma verificação em pushes e
pull requests.

Os testes utilizam fixtures e mocks. De acordo com a documentação atual
do projeto, não excluem contas nem alteram os pacientes do Atlas.

Para gerar o build de produção do frontend:

``` bash
npm run build
```

------------------------------------------------------------------------

`<a id="integração-com-o-cfm">`{=html}`</a>`{=html} \## 🩺 Integração
com o CFM

O cadastro de médicos consulta o Web Service oficial do Conselho Federal
de Medicina (CFM). O backend verifica se a inscrição está regular e
confere a correspondência entre CRM, UF, CPF e data de nascimento.

CPF e data de nascimento são enviados ao CFM durante a verificação e não
são persistidos pela aplicação. O perfil médico e suas rotas protegidas
são liberados após a confirmação.

Contas médicas criadas antes da integração podem passar por um fluxo de
revalidação. Após a conferência pelo CFM, o registro médico existente é
atualizado, preservando a conta e os dados associados.

### Modo local de apresentação sem licença CFM

Para apresentações locais, existe uma opção de demonstração restrita a
contas médicas já existentes no banco e que possuam perfil em `doctors`.
Ela não verifica nem confirma que o CRM está regular, e a interface deve
exibir o aviso de demonstração.

Não utilize esse modo como verificação real de credenciais médicas nem o
habilite inadvertidamente em produção.

A integração oficial exige que a própria pessoa jurídica usuária
solicite acesso ao Web Service e obtenha uma chave válida diretamente
com o CFM.

------------------------------------------------------------------------

`<a id="limitações-e-cuidados">`{=html}`</a>`{=html} \## ⚠️ Limitações e
cuidados

-   As classificações de indicadores utilizam faixas configuradas na
    plataforma e não substituem avaliação clínica.
-   A importação de exames depende de PDFs com texto extraível; arquivos
    digitalizados sem texto não passam pelo fluxo descrito.
-   A restauração de backup ainda não foi testada, conforme o registro
    de infraestrutura do projeto de 14/10/2026.
-   O cluster MongoDB Atlas Free mencionado na documentação não possuía
    backup automático ativo na conferência de 14/10/2026. Essa condição
    deve ser verificada antes de depender do ambiente para operação
    contínua.
-   O uso em produção requer revisão das variáveis de ambiente, HTTPS,
    permissões, capacidade de armazenamento e política de backup.

------------------------------------------------------------------------

`<a id="equipe">`{=html}`</a>`{=html} \## 👥 Equipe

  -----------------------------------------------------------------------
  Integrante                          Contribuição
  ----------------------------------- -----------------------------------
  **Jefferson Gomes**                 Pesquisa científica, validação de
                                      referências laboratoriais e
                                      organização dos dados de saúde.
                                      Também colaborou no frontend, com
                                      destaque para a página de
                                      referências científicas.

  **Natália Lugão**                   Frontend e UI/UX, com foco na
                                      construção visual e na experiência
                                      do usuário.

  **Sophia Coelho**                   Desenvolvimento de gráficos
                                      interativos e visualização de dados
                                      de saúde.

  **Gabriel Soares**                  Análises de risco, cálculos e
                                      regras de processamento dos dados
                                      de saúde.

  **André Melo**                      Processo criativo, construção do
                                      pitch e apresentação da proposta.
  -----------------------------------------------------------------------

O projeto foi desenvolvido em equipe no contexto acadêmico da FIAP, com
parceria da THM Estatística e orientação de mentores.

------------------------------------------------------------------------

`<a id="referências">`{=html}`</a>`{=html} \## 📚 Referências

-   [Conselho Federal de Medicina --- Web Service de consulta de
    médicos](https://sistemas.cfm.org.br/listamedicos/informacoes)
-   [CFM --- Especificação técnica
    SOAP](https://sistemas.cfm.org.br/listamedicos/arquivos/manualwebservices.pdf)
-   [Resolução CFM nº
    2.309/2022](https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2022/2309_2022.pdf)
-   [React](https://react.dev/)
-   [Vite](https://vite.dev/)
-   [React Router](https://reactrouter.com/)
-   [Recharts](https://recharts.org/)
-   [Bootstrap](https://getbootstrap.com/)
-   [MongoDB](https://www.mongodb.com/)

------------------------------------------------------------------------

::: {align="center"}
**Juicers --- informação organizada para apoiar a redução de danos.**
:::
