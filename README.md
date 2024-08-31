# TaskFlow

## Sobre esta solução

Esta é uma solução inicial baseada em camadas seguindo as práticas do Domain Driven Design (DDD). Todos os módulos fundamentais do ABP já estão instalados.


### Pré-requisitos

* [.NET8.0+ SDK](https://dotnet.microsoft.com/download/dotnet)
* [Node v18 or 20](https://nodejs.org/en)

### Configurações

A solução vem com uma configuração padrão que funciona imediatamente. No entanto, você pode considerar alterar as seguintes configurações antes de executar sua solução:

** Verifique as ConnectionStrings nos arquivos appsettings.json nos projetos TaskFlow.HttpApi.Host e TaskFlow.DbMigrator e altere-as se necessário. **


### Antes de executar a aplicação

**Execute o comando abp install-libs na pasta da sua solução para instalar as dependências dos pacotes do lado do cliente. Este passo é realizado automaticamente quando você cria uma nova solução, a menos que tenha desativado especialmente essa opção. No entanto, você deve executá-lo manualmente se tiver clonado essa solução do seu controle de origem pela primeira vez ou adicionado uma nova dependência de pacote do lado do cliente à sua solução.

** Execute TaskFlow.DbMigrator para criar o banco de dados inicial. Este passo também é realizado automaticamente quando você cria uma nova solução, a menos que tenha desativado especialmente essa opção. Isso deve ser feito na primeira execução. Também será necessário se uma nova migração de banco de dados for adicionada à solução posteriormente.


### Estrutura da solução

**Esta é uma aplicação monolítica em camadas que consiste nas seguintes aplicações:

**TaskFlow.DbMigrator: Uma aplicação console que aplica as migrações e também semeia os dados iniciais. É útil tanto em desenvolvimento quanto no ambiente de produção.
**TaskFlow.HttpApi.Host: Aplicação API ASP.NET Core que é usada para expor as APIs aos clientes.
**angular: Aplicação Angular.
