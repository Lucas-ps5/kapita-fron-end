import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRegister } from "@/hooks/useRegister";
import { useAuth } from "@/hooks/useAuth";

export default function Register() {
  const { t } = useTranslation(["register", "common"]);
  const { login } = useAuth();

  const { register, isPending, createUser } = useRegister();

  //   if (loading) {
  //     return (
  //       <div className="flex min-h-screen items-center justify-center bg-background">
  //         <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  //       </div>
  //     );
  //   }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
          <Wallet className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          KAPITA
        </h1>
        <p className="text-muted-foreground">
          {t("app_description", { ns: "register" })}
        </p>
      </div>

      <Card className="w-full max-w-sm border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">
            {t("title", { ns: "register" })}
          </CardTitle>
          <CardDescription>
            {t("description", { ns: "register" })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="space-y-4">
            <Input
              {...register("name")}
              name="name"
              type="text"
              label={t("name", { ns: "register" })}
              placeholder={t("name_placeholder", { ns: "register" })}
              className="h-12 text-base"
            />

            <Input
              {...register("email")}
              name="email"
              type="email"
              label={t("email", { ns: "register" })}
              placeholder={t("email_placeholder", { ns: "register" })}
              className="h-12 text-base"
            />

            <Input
              {...register("password")}
              name="password"
              type="password"
              label={t("password", { ns: "register" })}
              placeholder={t("password_placeholder", { ns: "register" })}
              className="h-12 text-base"
            />

            <Button
              type="submit"
              className="h-14 w-full text-base font-semibold"
              disabled={isPending}
            >
              {isPending
                ? t("loading", { ns: "common" })
                : t("submit", { ns: "register" })}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => login()}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {t("already_have_account", { ns: "register" })}{" "}
            {t("login", { ns: "register" })}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
