import React, { useState, useMemo } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash.debounce";

const fetchProducts = async (query) => {
  if (!query) return [];
  const { data } = await axios.get(
    `http://fakestoreapi.in/api/products?limit=15&search=${query}`
  );
  return data;
};

const SearchComponent = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const debounceSearch = useMemo(
    () =>
      debounce((value) => {
        setDebouncedSearch(value);
      }, 300),
    []
  );

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", debouncedSearch],
    queryFn: () => fetchProducts(debouncedSearch),
    enabled: !!debouncedSearch,
  });

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 bg-white rounded-lg shadow-md">
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          debounceSearch(e.target.value);
        }}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {isLoading && <p className="text-blue-500 mt-2">Loading...</p>}

      {isError && <p className="text-red-500 mt-2">Error fetching data.</p>}

      {products.length > 0 ? (
        <ul className="mt-2 border border-gray-200 rounded-md max-h-60 overflow-auto shadow-sm">
          {products.map((product) => (
            <li
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="p-3 cursor-pointer hover:bg-blue-100 transition duration-200"
            >
              {product.title}
            </li>
          ))}
        </ul>
      ) : (
        debouncedSearch && <p className="text-gray-500 mt-2">No results found</p>
      )}

      {selectedProduct && (
        <div className="mt-4 p-4 border border-gray-300 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold">{selectedProduct.title}</h2>
          <p className="text-gray-600">{selectedProduct.category}</p>
          <img
            src={selectedProduct.image}
            alt={selectedProduct.title}
            className="w-32 h-32 object-cover mt-2 rounded-md"
          />
        </div>
      )}
    </div>
  );
};

export default SearchComponent;