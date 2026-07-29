# Projeto Fênix PWA V1

## Publicação no GitHub Pages

Repositório esperado:

- Usuário: `regisedu13`
- Repositório: `projeto-fenix`

### Método mais simples, pelo navegador

1. Abra o repositório `projeto-fenix`.
2. Clique em **Add file** → **Upload files**.
3. Extraia este ZIP no computador.
4. Arraste todos os arquivos e pastas de dentro de `Projeto_Fenix_PWA_V1` para a área de upload.
5. Clique em **Commit changes**.
6. No repositório, abra **Settings** → **Pages**.
7. Em **Build and deployment**, escolha:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
8. Clique em **Save**.

Depois de alguns minutos, o endereço será:

`https://regisedu13.github.io/projeto-fenix/`

## Instalar no iPhone

1. Abra o endereço pelo Safari.
2. Toque no botão Compartilhar.
3. Toque em **Adicionar à Tela de Início**.
4. Confirme.

## Salvamento

Os dados ficam no armazenamento local do navegador do aparelho.

O aplicativo salva:

- missões;
- XP;
- treinos;
- cargas;
- repetições;
- diário;
- peso;
- cintura;
- perfil;
- histórico.

Use **Mais → Backup** para exportar regularmente o save em JSON.

## Funcionamento offline

Depois da primeira abertura completa, o service worker mantém os arquivos principais disponíveis sem internet.


## Atualização visual Black/Red

Esta versão altera apenas o visual:

- preto absoluto e grafite;
- vermelho profundo e vermelho vivo;
- cartões mais dramáticos;
- barras de progresso luminosas;
- botões e navegação redesenhados;
- melhor aparência em modo instalado.

O formato do save continua o mesmo da V1. Ao substituir os arquivos no GitHub,
os dados já gravados no iPhone permanecem no armazenamento local.

Depois de publicar, abra o app com internet uma vez. Se o visual antigo continuar:
1. feche o aplicativo;
2. abra novamente;
3. no Safari, recarregue a página uma vez.


## V1.2 — Diário de Bordo

O Diário foi reformulado sem alterar o restante do aplicativo:

- perguntas claras em cada campo;
- escalas visuais de 0 a 10;
- explicações dos extremos;
- relatório livre do dia;
- resumo automático;
- histórico dos últimos sete registros;
- atualização do registro do mesmo dia;
- mesma chave de save da V1.

Os dados anteriores permanecem compatíveis.


## V1.3
Missões por data local, reset diário automático, histórico, sequências atuais, melhores sequências, totais e calendário de 14 dias.


## V1.4 Complete

Incluído sem mudar o GitHub Pages ou a chave do save:

- calendário completo dos 45 dias;
- detalhes por data;
- estatísticas de hábitos, sono, energia, humor, peso e treinos;
- rotação automática ABC;
- histórico e sugestão de progressão por exercício;
- conquistas automáticas;
- backup com validação, versão, data e lembrete semanal;
- copiar save como texto;
- aviso de atualização disponível;
- diagnóstico de armazenamento e versão.

O save das versões anteriores continua compatível.


## V1.4.1 — Correção da abertura dos treinos

- compatibilidade com rascunhos e históricos de versões anteriores;
- tela de treino tolerante a campos ausentes;
- histórico de carga calculado uma única vez por exercício;
- recuperação automática caso um rascunho esteja corrompido;
- fallback visual em vez de tela travada.


## V1.4.2 — Tela de treino refeita

A tela de treino deixou de ser um modal de tela cheia e virou uma página normal do aplicativo.

Correções:
- rolagem vertical normal no iPhone;
- botão Sair sempre visível;
- saída sem perder o rascunho;
- botão Continuar treino na lista;
- cabeçalho fixo;
- campos salvos enquanto são preenchidos;
- compatibilidade com a área segura do iPhone;
- nenhuma trava de `body` ou viewport.


## V1.5 Expansion

Novos módulos:

- placar de consistência de 0 a 100;
- cigarros evitados e economia estimada em reais;
- registro completo de cardio;
- cardio marca automaticamente a missão diária;
- medidas corporais: peso, cintura, abdômen, peito, braço e coxa;
- evolução de cada medida;
- revisão semanal com comparação de tendências;
- arquivo de vitórias, dificuldades e ajustes;
- novos campos no perfil para referência do consumo de cigarro.

A chave do save e os dados anteriores continuam compatíveis.


## V1.6 — Nutrição básica

- contador diário de calorias;
- proteína, carboidratos e gorduras;
- estimativa de gasto diário;
- déficit ou superávit estimado;
- alimentos básicos internos;
- busca por alimento;
- refeições separadas;
- cadastro de alimento personalizado;
- remoção de itens;
- metas de calorias e proteína configuráveis;
- idade, sexo e nível de atividade no perfil.

Os valores nutricionais são estimativas.
