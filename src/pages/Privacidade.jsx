import PaginaLegal from '../components/PaginaLegal'
import { useTranslation } from '../context/LanguageContext'

const CONTATO = 'sophiacoelho40@gmail.com'
const RESPONSAVEL = 'André Felipe Xavier de Melo, Gabriel da Silva Soares, Jefferson Gomes Silva, Natalia Alves Lugão e Sophia Heringer Coelho'
const BANCO = 'MongoDB'

const T = {
    pt: {
        titulo: 'Política de Privacidade',
        subtitulo: 'O que coletamos, por quê, quem vê e como você apaga.',
        atualizado: '13 de outubro de 2026',

        resumo: [
            'Seus exames ficam em um banco de dados nosso, na nuvem — não no seu dispositivo.',
            'Só você e o profissional que você vincular conseguem vê-los.',
            'Você pode revogar o acesso do profissional e apagar sua conta quando quiser.',
            'Não vendemos, não compartilhamos para publicidade e não criamos perfil comercial.',
            'Dado de exame é dado sensível. Só tratamos com o seu consentimento explícito.',
        ],

        secoes: [
            {
                h: 'Quem é responsável',
                p: [
                    `A Juicers é um projeto de ${RESPONSAVEL}. Para qualquer assunto relativo aos seus dados, incluindo os pedidos descritos na seção 7, escreva para ${CONTATO}.`,
                ],
            },
            {
                h: 'Que dados coletamos',
                lista: [
                    'Cadastro: nome, e-mail e senha. A senha é guardada como hash, nunca em texto legível, e ninguém da equipe consegue lê-la.',
                    'Login com Google: se você entrar por essa opção, recebemos do Google o seu nome, e-mail e foto de perfil.',
                    'Perfil: as informações que você preenche no cadastro inicial, como data de nascimento, sexo, peso e altura.',
                    'Saúde: os arquivos PDF de exames que você envia, os valores numéricos extraídos deles (hematócrito, HDL, testosterona, enzimas hepáticas e demais marcadores) e a data de cada coleta.',
                    'Vínculo: o registro de qual profissional de saúde você autorizou a ver seus exames, e desde quando.',
                ],
                destaque: 'Dados sobre saúde são dados pessoais sensíveis (LGPD, art. 5º, II). Por isso só os tratamos com o seu consentimento explícito e específico (art. 11, I), e apenas para as finalidades da seção 3.',
            },
            {
                h: 'Para que usamos',
                lista: [
                    'Organizar seus exames em um histórico único e mostrar a evolução de cada marcador ao longo do tempo.',
                    'Comparar cada valor com a faixa de referência do laudo e sinalizar quando um marcador sai dela.',
                    'Permitir que o profissional de saúde que você vincular acompanhe esse histórico.',
                ],
                p: [
                    'Não usamos seus dados para publicidade, não os vendemos, não os cedemos a terceiros interessados e não construímos perfis comerciais a partir deles.',
                ],
            },
            {
                h: 'Onde os dados ficam',
                p: [
                    `Os dados não ficam no seu dispositivo. Ficam em um banco de dados ${BANCO}, e a aplicação é servida pela Vercel. O acesso ao banco é feito apenas pela nossa aplicação, com autenticação.`,
                ],
                lista: [
                    'Você: vê tudo o que enviou.',
                    'O profissional que você vincular: vê seus exames, marcadores e evolução. Não vê sua senha nem seus dados de acesso.',
                    'A equipe técnica do projeto: tem acesso ao banco apenas para manutenção e correção de falhas.',
                ],
                destaque: 'Ao revogar o vínculo, o profissional perde o acesso a partir daquele momento.',
            },
            {
                h: 'Com quem compartilhamos',
                p: [
                    'Com ninguém além dos serviços necessários para a aplicação existir: a Vercel (hospedagem da aplicação), o provedor do banco de dados, o Google (somente se você optar pelo login com Google) e o YouTube (vídeo institucional incorporado na página inicial, que carrega recursos do Google quando você assiste).',
                    'Não há anunciantes, corretores de dados nem qualquer forma de revenda.',
                ],
            },
            {
                h: 'Por quanto tempo guardamos',
                p: [
                    'Enquanto a sua conta existir. Se você pedir a exclusão, apagamos os seus dados de cadastro, de perfil e de exames — incluindo os PDFs enviados — em até 30 dias. O projeto não mantém cópias de segurança (backups) do banco de dados.',
                ],
            },
            {
                h: 'Seus direitos',
                p: [
                    'O art. 18 da LGPD garante a você, a qualquer momento e sem custo:',
                ],
                lista: [
                    'Confirmar que tratamos seus dados e acessar uma cópia deles.',
                    'Corrigir dados incompletos, inexatos ou desatualizados.',
                    'Pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários ou tratados fora da lei.',
                    'Pedir a portabilidade dos seus dados.',
                    'Saber com quem compartilhamos seus dados.',
                    'Revogar o consentimento e pedir a exclusão da conta.',
                ],
                destaque: `Para exercer qualquer um desses direitos, escreva para ${CONTATO}. Respondemos em até 15 dias.`,
            },
            {
                h: 'Segurança',
                p: [
                    'Senhas são guardadas com hash. O acesso à sua conta exige token de autenticação. A comunicação entre o navegador e o servidor é feita por HTTPS.',
                    'Nenhum sistema é totalmente seguro. Se ocorrer um incidente que possa trazer risco relevante a você, comunicaremos você e a Autoridade Nacional de Proteção de Dados, como exige o art. 48 da LGPD.',
                ],
            },
            {
                h: 'Menores de 18 anos',
                p: [
                    'A Juicers não se destina a menores de 18 anos e não coleta dados de menores conscientemente. Se identificarmos uma conta nessa situação, ela será excluída.',
                ],
            },
            {
                h: 'Mudanças nesta política',
                p: [
                    'Se mudarmos algo relevante, avisaremos pela própria plataforma antes da mudança entrar em vigor. A data no topo desta página indica a última revisão.',
                ],
            },
        ],
    },

    en: {
        titulo: 'Privacy Policy',
        subtitulo: 'This policy is maintained in Portuguese, the language the service operates in. Key points in English below; the Portuguese text is the binding version.',
        resumo: [
            'Your lab results are stored in our cloud database, not on your device.',
            'Only you and the health professional you link can see them.',
            'You can revoke that access and delete your account at any time.',
            'We never sell your data or use it for advertising.',
            `Questions or deletion requests: ${CONTATO}.`,
        ],
    },
}

export default function Privacidade() {
    const t = useTranslation(T, 'Privacidade.T')
    return <PaginaLegal conteudo={t} />
}
