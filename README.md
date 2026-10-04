📄 Gerador de Autorização Permanente de Retirada

Uma aplicação web ágil e responsiva para a emissão de Autorizações Permanentes de Portadores. Desenvolvida para facilitar o cadastro de motoristas e veículos autorizados a retirar mercadorias, gerando automaticamente um documento PDF formatado e pronto para receber a assinatura eletrônica oficial do gov.br.

✨ Funcionalidades

Geração de PDF no Client-Side: Utiliza a biblioteca jsPDF para montar e renderizar o documento PDF diretamente no navegador do usuário, garantindo a privacidade e segurança dos dados (nenhuma informação é enviada para servidores de terceiros).

Validação de Documentos: Algoritmos embutidos para validação em tempo real de CPFs e CNPJs (cálculo de dígitos verificadores).

Formatação Automática (Máscaras): Aplicação instantânea de máscaras para documentos, formatação de placas de veículos e conversão automática para letras maiúsculas.

Lógica de Negócio Integrada: Cálculo automático da data de validade da autorização (de 30 a 180 dias) com base na data de início selecionada.

Suporte a Temas (Light / Dark Mode): Interface de usuário inteligente que se adapta automaticamente às preferências de tema do sistema operacional do usuário.

Responsividade Total: Layout adaptável desenhado usando CSS Grid e Flexbox para funcionar perfeitamente em computadores, tablets e smartphones.

🛠️ Tecnologias Utilizadas

O projeto foi construído com tecnologias web fundamentais (Vanilla), priorizando a performance e a simplicidade de manutenção:

HTML5: Semântica e acessibilidade.

CSS3: Estilização com variáveis (Custom Properties) para temas, Media Queries para responsividade e uso extensivo de Grid/Flexbox.

JavaScript (ES6+): Lógica de formatação, manipulação do DOM e geração do PDF estruturado via arrays de Schema.

jsPDF (2.5.1): Biblioteca de código aberto para a criação de arquivos PDF complexos via JavaScript.

🚀 Como Executar o Projeto

Por ser uma aplicação inteiramente client-side (Front-end puro), a execução é extremamente simples e não requer nenhum ambiente de servidor (Node.js, PHP, etc) configurado.

Clone o repositório:

git clone https://github.com/renaldopetlim/nome-do-seu-repositorio.git


Navegue até o diretório:

cd nome-do-seu-repositorio


Abra o arquivo:
Basta dar um duplo clique no arquivo index.html para abri-lo no seu navegador de preferência.

💡 Dica: Você também pode hospedar este projeto gratuitamente no GitHub Pages, Vercel ou Netlify com apenas alguns cliques.

📋 Fluxo de Uso

O usuário preenche os dados do Cliente/Titular (Outorgante).

Define a vigência da autorização (entre 30 e 180 dias).

Cadastra até 4 motoristas e até 3 veículos (mínimo de 1 cada).

Clica em "Gerar PDF". O sistema valida os campos obrigatórios e a integridade dos CPFs/CNPJs.

Um arquivo nomeado Autorizacao_Permanente_[Nome_do_Cliente].pdf é baixado automaticamente.

O PDF deve ser enviado ao assinador oficial do Governo Federal (assinador.iti.br) para validação legal.