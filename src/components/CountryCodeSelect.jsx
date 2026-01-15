import React, { useEffect, useState } from "react";

function CountryCodeSelect({ defaultCode = "+91" }) {
  const [countries, setCountries] = useState([]);
  const [selectedCode, setSelectedCode] = useState(defaultCode);

  useEffect(() => {
    async function fetchCodes() {
      const res = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,idd,cca2"
      );
      const data = await res.json();

      const list = data
        .map((c) => {
          if (!c.idd?.root) return null;

          const root = c.idd.root;
          const suffix =
            c.idd.suffixes && c.idd.suffixes.length > 0
              ? c.idd.suffixes[0]
              : "";

          return {
            shortName: c.cca2, // country short name (IN, US...)
            name: c.name.common,
            code: `${root}${suffix}`,
          };
        })
        .filter(Boolean);

      // Sort alphabetically
      list.sort((a, b) => a.name.localeCompare(b.name));

      setCountries(list);
    }

    fetchCodes();
  }, []);

  return (
    <select className="form-select w-40"
      value={selectedCode}
      onChange={(e) => setSelectedCode(e.target.value)}>
      {countries.map((c) => (
        <option key={c.shortName} value={c.code}>
          {c.shortName} {c.code}
        </option>
      ))}
    </select>
  );
}

export default CountryCodeSelect;
