import { LegalLayout } from "@/components/layout/legal-layout";

export const metadata = {
  title: "Termos de Uso",
  description:
    "Termos de uso do Colalá, plataforma de descoberta de lugares e experiências.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Termos de Uso" updatedAt="16 de agosto de 2026">
      <section>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          1. Sobre o Colalá
        </h2>
        <p>
          O Colalá é uma plataforma de descoberta de lugares e experiências.
          Usuários podem criar um perfil público, favoritar estabelecimentos,
          marcar lugares como “Quero ir”, deixar avaliações e personalizar suas
          informações.
        </p>
        <p>
          O Colalá possui perfis e avaliações públicas. Ele não tem como
          finalidade principal funcionar como uma rede social de mensagens ou
          relacionamento.
        </p>
      </section>

      <section>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          2. Contas e cadastro
        </h2>
        <p>
          Para usar os recursos completos do Colalá, você pode criar uma conta
          com e-mail e senha ou entrar com sua conta Google. Você é responsável
          por manter suas credenciais seguras.
        </p>
        <p>
          Algumas funcionalidades exigem a confirmação do seu e-mail. Caso não
          confirme, você pode solicitar o reenvio do link de confirmação.
        </p>
      </section>

      <section>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          3. Conteúdo publicado pelos usuários
        </h2>
        <p>
          Você é responsável pelo conteúdo que publica, incluindo avaliações,
          comentários, nome de perfil, biografia e fotos.
        </p>
        <p>
          As avaliações devem ser honestas, baseadas na sua própria experiência
          e não podem conter conteúdo ofensivo, ilegal, discriminatório,
          fraudulento ou deliberadamente falso.
        </p>
        <p>
          O Colalá pode moderar ou remover conteúdo que viole estas regras, sem
          aviso prévio, e pode suspender ou encerrar contas em caso de abuso ou
          violação destes Termos.
        </p>
      </section>

      <section>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          4. Informações sobre os lugares
        </h2>
        <p>
          O Colalá não garante a precisão das informações fornecidas pelos
          estabelecimentos ou por fontes externas. Horários, preços,
          disponibilidade e outras informações podem mudar a qualquer momento.
        </p>
        <p>
          Sempre que possível, confirme as informações diretamente com o
          estabelecimento antes de se deslocar.
        </p>
      </section>

      <section>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          5. Uso aceitável
        </h2>
        <p>
          Ao usar o Colalá, você concorda em não utilizar a plataforma para fins
          ilegais, de assédio, de spam ou de qualquer forma que possa prejudicar
          outros usuários ou o funcionamento do serviço.
        </p>
      </section>

      <section>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          6. Suspensão e encerramento
        </h2>
        <p>
          Podemos suspender ou encerrar contas que violem estes Termos, que
          publiquem conteúdo abusivo ou que comprometam a segurança e o bom
          funcionamento da plataforma.
        </p>
      </section>

      <section>
        <h2 className="text-foreground text-xl font-bold tracking-tight">
          7. Alterações nestes Termos
        </h2>
        <p>
          Estes Termos podem ser atualizados no futuro. Quando houver alterações
          relevantes, a data de atualização no topo desta página será
          modificada. Recomendamos revisitar esta página periodicamente.
        </p>
      </section>
    </LegalLayout>
  );
}
