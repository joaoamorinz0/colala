import { LegalLayout } from "@/components/layout/legal-layout";

export const metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade do Colalá — saiba quais dados coletamos e como são usados.",
};

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-foreground text-base font-bold tracking-tight">
      {children}
    </h3>
  );
}

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Política de Privacidade"
      updatedAt="16 de agosto de 2026"
    >
      <section>
        <p>
          Esta Política de Privacidade descreve como o Colalá coleta, utiliza e
          armazena informações dos usuários da plataforma, em conformidade com a
          Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
        </p>
      </section>

      <section>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          1. Dados de autenticação
        </h2>
        <p>
          Para criar e acessar sua conta, o Colalá utiliza o serviço de
          autenticação Supabase Auth. Nesse fluxo, são informados:
        </p>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5">
          <li>
            <strong>E-mail e senha</strong> — quando você cria uma conta
            diretamente no Colalá. A senha é armazenada de forma segura pelo
            Supabase Auth e nunca é exibida em texto puro.
          </li>
          <li>
            <strong>Conta Google</strong> — quando você opta por entrar com
            Google, recebemos nome, e-mail e foto de perfil fornecidos pelo
            Google, conforme as permissões da sua conta Google.
          </li>
        </ul>
        <p>
          Para contas criadas com e-mail e senha, pode ser necessário confirmar
          o endereço de e-mail por meio de um link enviado por mensagem.
        </p>
      </section>

      <section>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          2. Dados do perfil
        </h2>
        <p>
          Ao usar o Colalá, você pode preencher as seguintes informações no seu
          perfil:
        </p>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5">
          <li>nome;</li>
          <li>nome de usuário (username);</li>
          <li>biografia;</li>
          <li>cidade;</li>
          <li>Instagram (opcional);</li>
          <li>foto de avatar;</li>
          <li>foto de capa/banner.</li>
        </ul>
        <SubHeading>Visibilidade do perfil</SubHeading>
        <p>
          O nome, o username, o avatar e as avaliações são públicos por padrão.
          A cidade e o Instagram possuem controles de visibilidade no aplicativo
          (configurações <em>show_city</em> e <em>show_instagram</em>): quando
          desativados, essas informações não aparecem no perfil público.
        </p>
        <p>O e-mail cadastrado não é exibido publicamente no perfil.</p>
      </section>

      <section>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          3. Conteúdo gerado por você
        </h2>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5">
          <li>
            <strong>Avaliações</strong> — nota de 1 a 5 e comentário opcional.
            Avaliações são públicas por padrão e aparecem no seu perfil público
            e na página do lugar avaliado.
          </li>
          <li>
            <strong>Favoritos</strong> — lugares marcados como favoritos. São
            privados: apenas você (e administradores, se necessário) pode ver
            essa lista.
          </li>
          <li>
            <strong>“Quero ir”</strong> — lista de lugares que você deseja
            visitar. Também é privada.
          </li>
          <li>
            <strong>Interesses</strong> — categorias que você marca como do seu
            interesse no perfil. São públicas, conforme o comportamento atual do
            perfil.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          4. Geolocalização
        </h2>
        <p>
          O Colalá pode solicitar sua localização através da permissão do seu
          navegador para recursos como mostrar lugares próximos e centralizar o
          mapa.
        </p>
        <p>
          <strong>
            As coordenadas da sua localização são processadas apenas no seu
            dispositivo
          </strong>{" "}
          para cálculo de distância até os lugares listados. Elas{" "}
          <strong>não são enviadas nem armazenadas</strong> no banco de dados do
          Colalá. Ao negar a permissão, o aplicativo continua funcionando,
          exibindo lugares recentes no lugar dos próximos.
        </p>
      </section>

      <section>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          5. Fotos enviadas (Storage)
        </h2>
        <p>
          Fotos que você envia, como avatar e capa do perfil, são armazenadas no
          Supabase Storage. Elas são públicas para leitura, de modo que possam
          ser exibidas no seu perfil público. O upload é permitido apenas para o
          conteúdo da sua própria conta.
        </p>
      </section>

      <section>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          6. Dados técnicos e armazenamento local
        </h2>
        <p>
          O Colalá utiliza cookies e armazenamento local (localStorage) do
          navegador para manter o estado da sua sessão de autenticação, por meio
          do Supabase Auth.
        </p>
        <p>
          O aplicativo também é uma Progressive Web App (PWA) e pode utilizar um
          Service Worker e cache para melhorar o carregamento e o funcionamento
          offline das páginas.
        </p>
        <p>
          Atualmente, o Colalá não utiliza ferramentas de analytics ou
          rastreamento de terceiros, pixels de publicidade ou cookies de
          marketing.
        </p>
      </section>

      <section>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          7. O que não coletamos
        </h2>
        <p>
          O Colalá não coleta dados de pagamento, não armazena localização em
          tempo real, não possui sistema de mensagens privadas e não coleta
          dados de terceiros para fins de publicidade.
        </p>
      </section>

      <section>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          8. Seus direitos (LGPD)
        </h2>
        <p>Você pode, a qualquer momento, solicitar:</p>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5">
          <li>acesso aos seus dados pessoais;</li>
          <li>correção de dados incorretos ou desatualizados;</li>
          <li>atualização dos seus dados;</li>
          <li>exclusão da sua conta e dos dados associados;</li>
          <li>portabilidade dos dados, quando aplicável;</li>
          <li>
            informações sobre como seus dados são tratados (esta Política).
          </li>
        </ul>
        <p>
          Para exercer seus direitos, entre em contato conosco. O canal de
          contato será informado quando disponível.{" "}
          <strong>
            Atualmente o Colalá ainda não possui um canal específico para
            solicitações de privacidade; recomendamos criá-lo antes do
            lançamento.
          </strong>
        </p>
      </section>

      <section>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          9. Alterações nesta Política
        </h2>
        <p>
          Esta Política pode ser atualizada para refletir mudanças no produto ou
          na legislação. A data de atualização no topo desta página indica a
          versão vigente.
        </p>
      </section>
    </LegalLayout>
  );
}
