import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocalStorage } from "react-use";
import { z } from "zod";

/**
 * @link https://developer.paypal.com/docs/reports/reference/paypal-supported-currencies/
 */

interface Currency {
  name: string;
  value: string;
}

const supportedCurrencies = [
  { name: "Australian dollar", value: "AUD" },
  { name: "Brazilian real", value: "BRL" },
  { name: "Canadian dollar", value: "CAD" },
  { name: "Chinese Renmenbi", value: "CNY" },
  { name: "Czech koruna", value: "CZK" },
  { name: "Danish krone", value: "DKK" },
  { name: "Euro", value: "EUR" },
  { name: "Hong Kong dollar", value: "HKD" },
  { name: "Hungarian forint", value: "HUF" },
  { name: "Israeli new shekel", value: "ILS" },
  { name: "Japanese yen", value: "JPY" },
  { name: "Malaysian ringgit", value: "MYR" },
  { name: "Mexican peso", value: "MXN" },
  { name: "New Taiwan dollar", value: "TWD" },
  { name: "New Zealand dollar", value: "NZD" },
  { name: "Norwegian krone", value: "NOK" },
  { name: "Philippine peso", value: "PHP" },
  { name: "Polish złoty", value: "PLN" },
  { name: "Pound sterling", value: "GBP" },
  { name: "Singapore dollar", value: "SGD" },
  { name: "Swedish krona", value: "SEK" },
  { name: "Swiss franc", value: "CHF" },
  { name: "Thai baht", value: "THB" },
  { name: "United States dollar", value: "USD" },
] as const satisfies Currency[];

const formDataSchema = z.object({
  username: z.string().trim().min(3),
  price: z.object({
    amount: z.number().positive(),
    currency: z.string().trim(),
  }),
});

type FormData = z.infer<typeof formDataSchema>;

interface Settings {
  username?: string;
  currency: string;
}

function App() {
  const [defaultSettings, setDefaultSettings] = useLocalStorage<Settings>(
    "settings",
    { currency: "EUR" }
  );
  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formDataSchema),
    defaultValues: {
      username: defaultSettings?.username,
      price: {
        currency: defaultSettings?.currency,
      },
    },
    mode: "onBlur",
  });

  const {
    username,
    price: { amount, currency },
  } = watch();
  const link = `https://paypal.me/${username}/${amount}${currency}`;

  function onSubmit(data: FormData) {
    setDefaultSettings({
      username: data.username,
      currency: data.price.currency,
    });
  }

  useEffect(() => {
    const subscription = watch(() => handleSubmit(onSubmit)());
    return () => subscription.unsubscribe();
  }, [handleSubmit, watch]);

  return (
    <div>
      <h1>PayPal.Me Link Generator</h1>

      <form>
        <div>
          <label htmlFor="username">Username</label>
          <input type="text" {...register("username")} />
          {errors.username && <p>{errors.username.message}</p>}
        </div>
        <div>
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            min="0"
            step="0.01"
            {...register("price.amount", {
              min: 0,
              valueAsNumber: true,
            })}
          />
          {errors.price?.amount && <p>{errors.price.amount.message}</p>}
        </div>
        <div>
          <label htmlFor="currency">Currency</label>
          <select {...register("price.currency")}>
            <option></option>
            {supportedCurrencies.map((currency) => (
              <option key={currency.value} value={currency.value}>
                {currency.name} ({currency.value})
              </option>
            ))}
          </select>
          {errors.price?.currency && <p>{errors.price.currency.message}</p>}
        </div>
      </form>

      {isValid && <output>{link}</output>}
    </div>
  );
}

export default App;
