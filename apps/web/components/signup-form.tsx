"use client"

import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { useSignup } from "~/hooks/api/auth"
import { SubmitHandler } from "react-hook-form"
import { trpc } from "~/trpc/client"

type SignupFormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { createUserWithEmailAndPasswordAsync } = useSignup()
  const router = useRouter();

  const { data: providers } = trpc.auth.getSupportedAuthenticationProviders.useQuery();
  const googleProvider = providers?.find(p => p.provider === "GOOGLE_OAUTH");

  const handleGoogleSignup = () => {
    if (googleProvider?.authUrl) {
      window.location.href = googleProvider.authUrl;
    }
  };
  const { register, handleSubmit, formState: { isSubmitting }, } = useForm<SignupFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit: SubmitHandler<SignupFormValues> = async (values) => {
    console.log(values)
    const { id } = await createUserWithEmailAndPasswordAsync({
      email: values.email, 
      fullName: values.name, 
      password: values.password
    })
    console.log(`User created with id: ${id}` )
    router.replace("/dashboard");
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            {...register("name")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email")}
          />
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" {...register("password")} />
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            {...register("confirmPassword")}
          />
          <FieldDescription>Please confirm your password.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit">Create Account</Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button variant="outline" type="button" onClick={handleGoogleSignup} disabled={!googleProvider}>
            Sign up with Google
          </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account? <a href="/login" className="hover:text-[#84cc16] text-[#84cc16] underline underline-offset-4">Sign in</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
