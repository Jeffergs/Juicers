# Check-up do projeto Juicers

Revisão de 14/10/2026. Análise do código e verificações locais, sem alterações de funcionalidade, acesso ao banco de produção ou validação clínica/jurídica. As observações de infraestrutura se limitam ao que está configurado no repositório.

## Resultado das verificações

- Build de produção: aprovado na versão atual; JavaScript principal aproximadamente 500 kB antes de gzip.
- ESLint: 32 erros e 1 aviso. Parte é configuração: a mesma configuração de navegador/React está sendo aplicada ao backend Node. Há também exports mistos de componentes/hooks, código sem uso e um efeito na tela de login sinalizado pelas regras de React.
- Testes: 21 aprovados usando `node --test src/controllers/followupController.test.js test/removeDoctorPatient.test.js` na pasta backend. São testes com dependências simuladas, não testes completos com navegador e MongoDB.
- Não existe script `npm test` no backend nem pipeline de CI no diretório .github.

## Prioridade 1 — dados e autenticação

### 1. Corrigir a promessa de privacidade na página inicial

`src/components/home/sobreProjeto/SecaoSobre.jsx:10` afirma que os dados ficam no dispositivo. Os controllers persistem perfil, exames e mensagens no MongoDB. A afirmação também está em inglês. Ajustar o texto para explicar armazenamento e compartilhamento com o médico vinculado, de acordo com a operação real.

### 2. Definir exclusão completa e retenção dos dados

`backend/src/controllers/patientController.js:100` remove somente Patient. User, Exam, ClinicalNote, RequestedExam e FollowupInteraction não são removidos por essa operação. Isso deixa referências órfãs e não equivale a apagar a conta. Criar um fluxo explícito de exclusão/exportação, definir quais registros devem ser conservados e por quê, e executar a operação de forma consistente. A exclusão de um vínculo com o médico deve continuar separada da exclusão da conta.

A equipe informou anteriormente que não há backups; isso não foi verificado no provedor. Antes do uso real, configurar recuperação, retenção e um teste de restauração. Ajustar o texto público quando essa operação mudar.

### 3. Padronizar sessão e credenciais

`backend/src/controllers/userController.js` emite JWT com validade de sete dias. A troca de senha altera o hash, mas o middleware não consulta versão de sessão nem revoga tokens já emitidos. `src/services/api.js` não centraliza a resposta a 401; `ProtectedRoute` aceita a sessão salva localmente sem verificar validade.

Implementar expiração visível, limpeza da sessão em 401 e revogação após troca de senha. O token está em localStorage: revisar o modelo de armazenamento e a proteção contra injeção de scripts. Se migrar para cookie HttpOnly, incluir a proteção adequada para requisições autenticadas.

Cadastro/login usam e-mail sem a mesma normalização aplicada na edição de perfil e no login Google. Normalizar trim/lowercase em todos os caminhos; validar formato, tipo e tamanho no servidor. O cadastro não verifica comprimento da senha, embora a troca de senha verifique. Adicionar proteção contra tentativas repetidas nos endpoints de autenticação.

### 4. Validar resultados laboratoriais no servidor

`backend/src/controllers/examController.js:16` e `:111` aceitam markers, riskLevel e alerts enviados pelo cliente. `backend/src/models/Exam.js` usa Mixed para os marcadores e String para a data. A classificação persistida pode divergir dos valores.

Validar identificadores de marcadores, valores finitos, datas e unidades; calcular alertas/classificação no servidor com regras compartilhadas e versionadas. Não considerar a classificação fornecida pelo navegador como autoridade. Os valores de referência e as regras precisam de revisão dos responsáveis clínicos.

## Prioridade 2 — consistência dos fluxos

### 5. Tornar importação consistente e revisável

`submitRequestedResult` cria o exame, salva a solicitação e atualiza o paciente em operações separadas. Uma falha no meio pode deixar estado parcial; uma repetição pode cadastrar o mesmo exame novamente. Adotar transação onde o ambiente permitir ou um mecanismo equivalente de recuperação, mais proteção contra duplicidade.

O upload limita PDF a 5 MB e filtra MIME, mas MIME é informado pelo cliente. Conferir conteúdo do arquivo e padronizar mensagens. Na rota do paciente, erro de upload retorna 400; na rota do médico, o mesmo erro pode chegar ao handler geral e virar 503. Oferecer revisão dos valores extraídos antes da confirmação e tratar PDF escaneado/sem texto explicitamente.

### 6. Separar falha de carregamento de ausência de dados

`src/pages/PerfilAtleta.jsx` registra a falha no console e segue exibindo o dashboard com valores vazios. Mostrar erro com opção de tentar novamente; não apresentar uma falha de API como se o paciente ainda não tivesse exames.

`ClinicalProvider` está montado globalmente em App e consulta perfil/exames uma vez, inclusive nas páginas públicas, antes do login. `useClinicalState` não acompanha troca de usuário e expõe ações vazias como addUpload. A tela PerfilAtletaMedico ainda consome esse contexto. Revisar o fluxo dessa tela, montar providers somente na área apropriada e limpar/recarregar dados ao mudar a sessão.

### 7. Consolidar atualizações do dashboard e acompanhamento

O acompanhamento atualiza a cada 15 segundos; o dashboard do paciente carrega ao montar. Centralizar invalidação de exames após upload e revisão, com atualização ao recuperar foco. Preservar as confirmações de leitura existentes. Mostrar claramente enviado, recebido e revisado; uma notificação recebida fora do site seria uma evolução posterior, com preferência do usuário.

### 8. Resolver ações sem efeito

`src/components/planos/Planos.jsx:219` renderiza CTAs sem handler ou link. Conectar a um fluxo real, ou comunicar que o plano ainda não está disponível. Conferir se as promessas comerciais (como interpretação por IA) correspondem às funções entregues: os uploads analisados usam extração de texto/regras no código.

## Prioridade 3 — manutenção, visual e desempenho

- Corrigir a configuração de lint separando Node e React; depois resolver os erros reais. Criar scripts de testes e CI com build, lint e testes.
- Acrescentar testes de cadastro/login, expiração de sessão, importação, datas/unidades, exclusão e troca de conta. Criar um teste completo do fluxo paciente envia → médico responde → paciente lê.
- Reutilizar tokens de cores e componentes de botão, modal, card e estados de erro. Há três folhas com estilos globais/importação de Bootstrap e muitos estilos inline; reduzir conflitos gradualmente, preservando os layouts aprovados.
- Corrigir o espaço reservado para a navbar fixa nas páginas públicas: o título do mapa pode ficar encoberto. Manter o formato original do mapa; isso é um ajuste de espaçamento, não um redesenho.
- Completar PT/EN nas áreas autenticadas e nos uploads; a tradução da página inicial não cobre todas as telas.
- Conferir teclado, foco dos modais, labels e contraste. Os marcadores SVG do mapa original respondem ao clique, mas não têm controle de teclado; o seletor de upload usa input com display:none.
- Otimizar imagens: o build inclui uma imagem de marca de aproximadamente 2,13 MB e favicon de cerca de 408 kB. Usar dimensões/formato adequados e carregar gráficos/páginas sob demanda.
- Paginar históricos e listas. As consultas de exames/mensagens retornam todos os registros; adicionar índices conforme as consultas e o volume medido.
- Restringir CORS às origens necessárias: app.js usa origin:true. Isso não substitui a autorização, que já existe nas rotas médicas. Revisar headers de segurança e respostas de erro sem expor mensagens internas.
- Atualizar README: partes ainda descrevem estrutura e persistência antigas.

## Ordem sugerida

1. Privacidade, exclusão, sessão e validação dos exames.
2. Consistência de upload, atualização e estados de erro.
3. Testes automatizados e CI.
4. Tradução, acessibilidade e ações comerciais.
5. Otimização de imagens, carregamento e consultas.

A base já possui controles de vínculo médico–paciente, verificação médica, senhas com hash, limite de upload e testes de autorização/leitura. Preservar esses controles ao implementar as melhorias. Os testes locais aprovados não substituem uma revisão de produção nem validam a precisão clínica das regras.
