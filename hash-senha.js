// Rode no SEU terminal (nunca peça pra IA executar):
//   node hash-senha.js SuaSenhaForte123
//
// Isso so IMPRIME o hash da senha — não salva em nenhum arquivo.
// Copie o hash impresso e cole no painel da Vercel em:
//   Settings > Environment Variables > ADMIN_PASSWORD_HASH
const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
  console.error('Uso: node hash-senha.js SuaSenha');
  process.exit(1);
}

console.log(bcrypt.hashSync(password, 10));
