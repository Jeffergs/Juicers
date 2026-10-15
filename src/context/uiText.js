import { useLanguage } from './language'
const EN = {
    'Histórico de Exames': 'Lab history', 'Acompanhamento Médico': 'Medical follow-up', 'Dados da Conta': 'Account details', 'Meus Atletas': 'My patients', 'Sair': 'Sign out',
    'Segurança e seus dados': 'Security and your data', 'Baixar meus dados': 'Download my data', 'Preparando cópia…': 'Preparing download…',
    'Senha atual': 'Current password', 'Nova senha': 'New password', 'Alterar senha e encerrar sessões': 'Change password and end sessions', 'Excluir minha conta': 'Delete my account',
    'A exclusão é definitiva.': 'Deletion is permanent.', 'Digite EXCLUIR': 'Type EXCLUIR', 'Confirmar exclusão definitiva': 'Confirm permanent deletion', 'Cancelar': 'Cancel', 'Excluindo…': 'Deleting…',
    'Baixe uma cópia do seu cadastro, exames e conversas antes de excluir a conta.': 'Download your account details, exams and conversations before deleting your account.',
    'Contas Google entram pelo Google e não possuem senha local.': 'Google accounts sign in through Google and do not have a local password.',
    'Cadastro, perfil, exames, mensagens, orientações e solicitações serão apagados. O médico perderá o acesso.': 'Your account, profile, exams, messages, guidance and requests will be deleted. Your doctor will lose access.',
    'Confirme sua senha atual acima. Se usa Google,': 'Confirm your current password above. If you use Google,', 'entre novamente': 'sign in again', 'e conclua a exclusão em até 15 minutos.': 'and complete deletion within 15 minutes.',
    'Importar exame (PDF)': 'Upload lab report (PDF)', 'Importando...': 'Uploading...', 'Selecionar arquivo': 'Choose file', 'Arraste o arquivo PDF aqui, ou': 'Drag a PDF here, or',
    'PDF importado com sucesso': 'PDF uploaded successfully', 'Selecione um arquivo PDF.': 'Choose a PDF file.', 'O PDF deve ter até 5 MB.': 'The PDF must be 5 MB or smaller.', 'Erro ao importar PDF.': 'Unable to upload the PDF.',
    'Tentar novamente': 'Try again', 'Carregando dashboard...': 'Loading dashboard...', 'Último exame:': 'Last exam:', 'Não informado': 'Not provided',
    'Meu acompanhamento': 'My follow-up', 'Plano de acompanhamento': 'Follow-up plan', 'Orientações do profissional': 'Doctor guidance', 'Comunicação': 'Messages',
    'Enviar mensagem': 'Send message', 'Enviar dúvida': 'Send question', 'Enviar resultado': 'Upload result', 'Registrar exame realizado': 'Mark exam as completed',
    'Histórico do acompanhamento': 'Follow-up history', 'Ver histórico completo': 'View full history', 'Ver todos os exames': 'View all exams',
    'Próximo exame': 'Next exam', 'Última revisão': 'Last review', 'Pendências': 'Pending actions', 'Status do acompanhamento': 'Follow-up status',
    'Profissional responsável': 'Your doctor', 'Vinculado': 'Linked', 'Ativo': 'Active', 'Prazo a definir': 'Date not set', 'Solicitado': 'Requested', 'Agendado': 'Scheduled', 'Realizado': 'Completed', 'Resultado disponível': 'Result available', 'Aguardando': 'Pending',
    'Motivo do acompanhamento': 'Reason for follow-up', 'Resultado revisado': 'Result reviewed', 'Aguardando revisão do profissional': 'Awaiting doctor review',
    'Li e entendi': 'Read and understood', 'Tenho uma dúvida': 'I have a question', 'Marcar resposta como lida': 'Mark reply as read', 'Resposta nova': 'New reply',
    'Sua mensagem': 'Your message', 'Selecione o PDF do exame': 'Choose the lab report PDF', 'Enviar': 'Send', 'Enviando…': 'Sending…',
    'Este canal não é destinado a emergências.': 'This channel is not intended for emergencies.', 'Nenhum profissional vinculado ainda': 'No doctor linked yet',
    'Nenhuma orientação registrada ainda.': 'No guidance yet.', 'Suas mensagens e respostas aparecerão aqui.': 'Your messages and replies will appear here.',
    'Data de realização': 'Completion date', 'Salvar': 'Save', 'Fechar': 'Close', 'Entrada de mensagens': 'Message inbox', 'Atualizar mensagens': 'Refresh messages',
}
export function translateUi(text, lang) { return lang === 'en' ? EN[text] || text : text }
export function useUiText() { const { lang } = useLanguage(); return text => translateUi(text, lang) }
