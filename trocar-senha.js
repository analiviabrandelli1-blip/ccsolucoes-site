// Rode este script no SEU terminal (nunca peça para a IA executar):
//   node trocar-senha.js seuemail@exemplo.com NovaSenhaForte123
//
// Isso atualiza data/admin.json com o novo email/senha (a senha é guardada
// como hash, nunca em texto puro).
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error('Uso: node trocar-senha.js seuemail@exemplo.com NovaSenha');
  process.exit(1);
}

const adminFile = path.join(__dirname, 'data', 'admin.json');
const passwordHash = bcrypt.hashSync(password, 10);

fs.writeFileSync(adminFile, JSON.stringify({ email, passwordHash }, null, 2));
console.log('Senha atualizada com sucesso para o email:', email);
