import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

// Goes to /search?q=... unless a custom onSearch is given.
export default function SearchBar({ defaultValue = '', onSearch, large = false, placeholder = 'Search for food or restaurants' }) {
  const [value, setValue] = useState(defaultValue);
  const navigate = useNavigate();

  useEffect(() => { setValue(defaultValue); }, [defaultValue]);

  const submit = (e) => {
    e.preventDefault();
    const q = value.trim();
    if (onSearch) onSearch(q);
    else navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  const clear = () => {
    setValue('');
    if (onSearch) onSearch('');
  };

  return (
    <form className={`searchbar ${large ? 'searchbar-lg' : ''}`} onSubmit={submit} role="search">
      <Search size={large ? 22 : 18} className="searchbar-icon" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        maxLength={80}
      />
      {value && <button type="button" className="searchbar-clear" onClick={clear} aria-label="Clear search"><X size={16} /></button>}
      <button type="submit" className="btn btn-primary searchbar-btn">Search</button>
    </form>
  );
}
