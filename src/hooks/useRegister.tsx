import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { CreateUser, UserService } from "@/api/authentis-users";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";

const registerSchema = yup.object({
  name: yup
    .string()
    .required("field_required")
    .min(2, "name_too_short")
    .max(50, "name_too_long"),

  email: yup.string().required("field_required").email("invalid_email"),

  password: yup
    .string()
    .required("field_required")
    .min(6, "password_too_short"),
});

type RegisterFormValues = yup.InferType<typeof registerSchema>;

export const useRegister = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const { mutate, isSuccess, isPending } = useMutation({
    mutationFn: async (payload: CreateUser) => {
      const { data, error } = await UserService.register({
        body: payload,
      });
      if (error) {
        throw error;
      }
      return data;
    },

    onSuccess: () => {
      // Redirect to login with success message
      navigate("/login");
    },

    onError: (error) => {
      console.error("Registration failed:", error.message);
    },
  });

  const createUser = handleSubmit((values) =>
    mutate({
      userName: values.name,
      email: values.email,
      password: values.password,
    }),
  );

  return { register, isPending, createUser };
};
