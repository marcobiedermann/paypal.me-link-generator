import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCopyToClipboard, useLocalStorage } from "react-use";
import { z } from "zod";

const PAYPAL_ME_URL = "https://paypal.me";

/**
 * @link https://developer.paypal.com/docs/reports/reference/paypal-supported-currencies/
 */

interface Currency {
  name: string;
  value: string;
  symbol: string;
}

const supportedCurrencies = [
  { name: "Australian dollar", value: "AUD", symbol: "A$" },
  { name: "Brazilian real", value: "BRL", symbol: "R$" },
  { name: "Canadian dollar", value: "CAD", symbol: "C$" },
  { name: "Chinese Renmenbi", value: "CNY", symbol: "¥" },
  { name: "Czech koruna", value: "CZK", symbol: "Kč" },
  { name: "Danish krone", value: "DKK", symbol: "kr" },
  { name: "Euro", value: "EUR", symbol: "€" },
  { name: "Hong Kong dollar", value: "HKD", symbol: "HK$" },
  { name: "Hungarian forint", value: "HUF", symbol: "Ft" },
  { name: "Israeli new shekel", value: "ILS", symbol: "₪" },
  { name: "Japanese yen", value: "JPY", symbol: "¥" },
  { name: "Malaysian ringgit", value: "MYR", symbol: "RM" },
  { name: "Mexican peso", value: "MXN", symbol: "MX$" },
  { name: "New Taiwan dollar", value: "TWD", symbol: "NT$" },
  { name: "New Zealand dollar", value: "NZD", symbol: "NZ$" },
  { name: "Norwegian krone", value: "NOK", symbol: "kr" },
  { name: "Philippine peso", value: "PHP", symbol: "₱" },
  { name: "Polish złoty", value: "PLN", symbol: "zł" },
  { name: "Pound sterling", value: "GBP", symbol: "£" },
  { name: "Singapore dollar", value: "SGD", symbol: "S$" },
  { name: "Swedish krona", value: "SEK", symbol: "kr" },
  { name: "Swiss franc", value: "CHF", symbol: "CHF" },
  { name: "Thai baht", value: "THB", symbol: "฿" },
  { name: "United States dollar", value: "USD", symbol: "$" },
] as const satisfies Currency[];

const defaultCurrency = "EUR";

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
  const [, copyToClipboard] = useCopyToClipboard();
  const [defaultSettings, setDefaultSettings] = useLocalStorage<Settings>(
    "settings",
    {
      currency: defaultCurrency,
    }
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
  const link = `${PAYPAL_ME_URL}/${username}/${amount}${currency}`;

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
    <div className="app">
      <div className="container">
        <h1>PayPal.Me Link Generator</h1>

        <form className="form">
          <div className="form__field">
            <label className="form__label" htmlFor="username">
              @
            </label>
            <input
              className="form__input form__input--text"
              type="text"
              id="username"
              {...register("username")}
            />
            {errors.username && <p>{errors.username.message}</p>}
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="amount">
              {
                supportedCurrencies.find(
                  (supportedCurrency) => supportedCurrency.value === currency
                )?.symbol
              }
            </label>
            <input
              className="form__input form__input--text"
              type="number"
              min="0"
              step="0.01"
              id="amount"
              {...register("price.amount", {
                min: 0,
                valueAsNumber: true,
              })}
            />
            <select
              className="form__input form__input--select"
              {...register("price.currency")}
            >
              <option></option>
              {supportedCurrencies.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.name} ({currency.value})
                </option>
              ))}
            </select>
            {errors.price?.amount && <p>{errors.price.amount.message}</p>}
          </div>
        </form>

        {isValid && (
          <output>
            {link}{" "}
            <button onClick={() => copyToClipboard(link)}>
              <Link size={16} />
            </button>
          </output>
        )}
      </div>
    </div>
  );
}

export default App;
