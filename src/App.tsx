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
  username: z.string(),
  price: z.object({
    amount: z.number().positive(),
    currency: z.string(),
  }),
});

type FormData = z.infer<typeof formDataSchema>;

function App() {
  const [defaultUsername, setDefaultUsername] =
    useLocalStorage<string>("paypay-username");
  const [defaultCurrency, setDefaultCurrency] =
    useLocalStorage<string>("currency");
  const { register, watch } = useForm<FormData>({
    resolver: zodResolver(formDataSchema),
    defaultValues: {
      username: defaultUsername,
      price: {
        amount: 10,
        currency: defaultCurrency,
      },
    },
  });

  const {
    username,
    price: { amount, currency },
  } = watch();
  const link = `https://paypal.me/${username}/${amount}${currency}`;

  useEffect(() => {
    setDefaultUsername(username);
    setDefaultCurrency(currency);
  }, [currency, username]);

  return (
    <div>
      <h1>PayPal.Me Link Generator</h1>

      <form>
        <div>
          <label htmlFor="username">Username</label>
          <input type="text" {...register("username")} />
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
        </div>
      </form>

      <output>{link}</output>
    </div>
  );
}

export default App;
