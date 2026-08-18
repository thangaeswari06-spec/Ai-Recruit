```javascript
import { useEffect, useState } from "react";

export default function SearchBar({
  placeholder = "Search...",
  onSearch,
  delay = 350,
}) {

  const [value, setValue] = useState("");

  useEffect(() => {

    const timer = setTimeout(() => {
      onSearch?.(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };

  }, [value, delay, onSearch]);

  return (

    <div className="topbar-search">

      <span className="topbar-search-icon">
        🔍
      </span>

      <input
        type="search"
        value={value}
        onChange={(event) =>
          setValue(event.target.value)
        }
        placeholder={placeholder}
        aria-label="Search"
      />

    </div>

  );
}
```
