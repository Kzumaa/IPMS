import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginStaff } from "../features/auth/authSlice";
import { loginSchema, type LoginSchema } from "../features/auth/schemas";

const StaffLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/staff/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginSchema) => {
    await dispatch(loginStaff(data));
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-[#1F2937] group/design-root overflow-x-hidden font-public">
      <div className="layout-container flex h-full min-h-screen grow flex-col">
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl bg-background-light dark:bg-[#374151] p-8 shadow-lg">
            <div
              className="flex flex-col items-center gap-4 text-center cursor-pointer"
              onClick={() => navigate("/")}
            >
              <svg
                className="h-10 w-10 text-slate-300"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"></path>
              </svg>
              <h2 className="text-slate-800 dark:text-white tracking-light text-[28px] font-bold leading-tight">
                {t("login.staffLoginTitle")}
              </h2>
            </div>

            {error && (
              <div
                className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <form
              className="flex w-full flex-col items-stretch gap-4 pt-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              <label className="flex flex-col flex-1">
                <p className="text-slate-700 dark:text-slate-200 text-base font-medium leading-normal pb-2">
                  {t("login.staffIdLabel")}
                </p>
                <input
                  {...register("email")}
                  className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#194cb3]/50 border ${
                    errors.email
                      ? "border-red-500"
                      : "border-slate-300 dark:border-[#3d4452]"
                  } bg-white dark:bg-[#1c1f26] h-14 placeholder:text-slate-400 dark:placeholder:text-[#9ea7b7] p-[15px] text-base font-normal leading-normal`}
                  placeholder={t("login.staffIdPlaceholder")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </label>
              <label className="flex flex-col flex-1">
                <p className="text-slate-700 dark:text-slate-200 text-base font-medium leading-normal pb-2">
                  {t("login.passwordLabel")}
                </p>
                <div className="flex w-full flex-1 items-stretch rounded-lg">
                  <input
                    {...register("password")}
                    className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#194cb3]/50 border ${
                      errors.password
                        ? "border-red-500"
                        : "border-slate-300 dark:border-[#3d4452]"
                    } bg-white dark:bg-[#1c1f26] h-14 placeholder:text-slate-400 dark:placeholder:text-[#9ea7b7] p-[15px] rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal`}
                    placeholder={t("login.passwordPlaceholder")}
                    type="password"
                  />
                  <div className="text-slate-400 dark:text-[#9ea7b7] flex border border-slate-300 dark:border-[#3d4452] bg-white dark:bg-[#1c1f26] items-center justify-center px-3 rounded-r-lg border-l-0">
                    <span className="material-symbols-outlined text-2xl cursor-pointer">
                      visibility
                    </span>
                  </div>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </label>
              <div className="flex w-full py-3 justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#194cb3] hover:bg-[#194cb3]/90 text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">
                    {isLoading ? "Authenticating..." : t("login.authenticate")}
                  </span>
                </button>
              </div>
            </form>
            <p className="text-slate-500 dark:text-[#9ea7b7] text-sm font-normal leading-normal pt-1 text-center underline cursor-pointer hover:text-[#194cb3] dark:hover:text-slate-300 transition-colors duration-200">
              {t("login.needHelp")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLoginPage;
