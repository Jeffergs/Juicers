import PaginaLegal from '../components/PaginaLegal'
import { useTranslation } from '../context/language'

const CONTATO = 'sophiacoelho40@gmail.com'
const RESPONSAVEL = 'André Felipe Xavier de Melo, Gabriel da Silva Soares, Jefferson Gomes Silva, Natalia Alves Lugão e Sophia Heringer Coelho'
const FORO = 'São Paulo/SP'

const T = {
    pt: {
        titulo: 'Termos de Uso',
        subtitulo: 'O que a Juicers faz, o que ela não faz e de quem é cada responsabilidade.',
        atualizado: '13 de outubro de 2026',

        resumo: [
            'A Juicers organiza exames e mostra tendências. Ela não é um serviço médico.',
            'Não prescrevemos ciclos, doses ou substâncias, e não emitimos diagnóstico.',
            'A leitura automática de PDF pode falhar: confira sempre contra o laudo original.',
            'A responsabilidade clínica é sempre do profissional de saúde, nunca da plataforma.',
            'Uso restrito a maiores de 18 anos.',
        ],

        secoes: [
            {
                h: 'O que a Juicers é',
                p: [
                    'A Juicers é uma ferramenta de organização, acompanhamento e educação em saúde, voltada à redução de danos. Ela reúne os seus exames em um histórico único, compara cada marcador com a faixa de referência informada no próprio laudo, mostra como ele evolui ao longo do tempo e indica quando vale procurar um profissional.',
                    `Ao criar uma conta, você concorda com estes Termos e com a Política de Privacidade. O serviço é mantido por ${RESPONSAVEL}.`,
                ],
            },
            {
                h: 'O que a Juicers não é',
                lista: [
                    'Não é um serviço médico, uma clínica ou um laboratório.',
                    'Não prescreve ciclos, doses, protocolos ou substâncias.',
                    'Não emite diagnóstico, laudo, receita ou atestado.',
                    'Não substitui consulta, exame clínico ou acompanhamento profissional.',
                    'Não incentiva o uso de anabolizantes.',
                ],
                destaque: 'Os alertas da plataforma são sinalizações automáticas baseadas nas faixas de referência do laboratório. Eles indicam que um número saiu de uma faixa — não que existe uma doença, e não dispensam avaliação. A interpretação clínica é sempre de um profissional habilitado.',
            },
            {
                h: 'Quem pode usar',
                p: [
                    'Pessoas maiores de 18 anos, com capacidade civil. A conta é pessoal e intransferível, e você é responsável por manter sua senha em segurança e por tudo que for feito com as suas credenciais.',
                ],
            },
            {
                h: 'Suas responsabilidades',
                lista: [
                    'Enviar apenas exames seus e verdadeiros, sem alterar os arquivos.',
                    'Conferir os valores lidos automaticamente contra o laudo original antes de tirar qualquer conclusão.',
                    'Manter seus dados de perfil atualizados, já que eles influenciam a leitura dos indicadores.',
                    'Não usar a plataforma para orientar clinicamente outra pessoa se você não for profissional habilitado para isso.',
                ],
            },
            {
                h: 'Para profissionais de saúde e do fitness',
                p: [
                    'O acesso ao histórico de um paciente depende de vínculo aceito por ele e pode ser revogado por ele a qualquer momento.',
                    'A plataforma organiza e apresenta dados; ela não emite conduta. A responsabilidade pela avaliação, pela decisão e pela orientação é integralmente do profissional, dentro dos limites do seu conselho de classe.',
                    'Profissionais do fitness não devem usar os dados da plataforma para orientar o uso de substâncias, o que está fora das suas atribuições. O papel esperado é reconhecer sinais de atenção e encaminhar para avaliação médica.',
                ],
            },
            {
                h: 'Vínculo entre atleta e profissional',
                p: [
                    'O vínculo só existe se você aceitar o convite do profissional. Enquanto ele durar, o profissional vê seus exames, marcadores e evolução — e não vê sua senha nem seus dados de acesso.',
                    'Você pode revogar o vínculo a qualquer momento pela área de acompanhamento, e o acesso é interrompido a partir daquele momento.',
                ],
            },
            {
                h: 'Limites de responsabilidade',
                p: [
                    'A leitura automática de PDF depende do formato de cada laboratório e pode falhar, deixar de reconhecer um marcador ou extrair um valor incorreto. Por isso o laudo original é sempre a fonte de verdade.',
                    'Não nos responsabilizamos por decisões sobre saúde tomadas com base exclusivamente na plataforma, sem avaliação profissional, nem por consequências do uso de substâncias.',
                ],
            },
            {
                h: 'Disponibilidade do serviço',
                p: [
                    'A Juicers é oferecida no estado em que se encontra. Podemos alterar, suspender ou encerrar funcionalidades, e não garantimos disponibilidade ininterrupta. Avisaremos com antecedência razoável em caso de encerramento, com prazo para você exportar seus dados.',
                ],
            },
            {
                h: 'Conteúdo e propriedade',
                p: [
                    'A marca, o código, o texto e o material educativo da Juicers pertencem ao projeto. Os seus exames e dados pertencem a você: a plataforma apenas os armazena e apresenta, conforme a Política de Privacidade.',
                ],
            },
            {
                h: 'Encerramento da conta',
                p: [
                    `Você pode encerrar sua conta quando quiser, pelos dados da conta ou escrevendo para ${CONTATO}. Podemos encerrar contas que violem estes Termos, com aviso prévio sempre que possível.`,
                ],
            },
            {
                h: 'Lei aplicável',
                p: [
                    `Estes Termos são regidos pela lei brasileira, em especial a Lei Geral de Proteção de Dados (Lei 13.709/2018), o Marco Civil da Internet (Lei 12.965/2014) e o Código de Defesa do Consumidor. Fica eleito o foro de ${FORO}.`,
                ],
            },
        ],
    },

    en: {
        titulo: 'Terms of Use',
        subtitulo: 'These terms are maintained in Portuguese, the language the service operates in. Key points in English below; the Portuguese text is the binding version.',
        resumo: [
            'Juicers organizes lab results and shows trends. It is not a medical service.',
            'It does not prescribe cycles, doses or substances, and issues no diagnosis.',
            'Automatic PDF reading can fail — always check against the original report.',
            'Clinical responsibility always rests with the health professional.',
            'Restricted to users aged 18 and over.',
        ],
    },
}

export default function Termos() {
    const t = useTranslation(T, 'Termos.T')
    return <PaginaLegal conteudo={t} />
}
