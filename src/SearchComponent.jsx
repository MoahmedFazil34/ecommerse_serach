import React, { useState, useMemo, useEffect, useRef } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import debounce from "lodash.debounce";

const fetchProducts = async () => {
  const { data } = await axios.get("https://fakestoreapi.com/products");
  return data;
};

const SearchComponent = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const listRef = useRef(null);

  const debounceSearch = useMemo(
    () =>
      debounce((value) => {
        setDebouncedSearch(value);
      }, 300),
    []
  );

  const {
    data: allProducts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const filteredProducts = useMemo(() => {
    if (!debouncedSearch) return [];
    return allProducts.filter((product) =>
      product.title.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [debouncedSearch, allProducts]);

  const handleKeyDown = (e) => {
    if (filteredProducts.length === 0) return;

    if (e.key === "ArrowDown") {
      setHighlightIndex((prevIndex) =>
        prevIndex < filteredProducts.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === "ArrowUp") {
      setHighlightIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : prevIndex
      );
    } else if (e.key === "Enter" && highlightIndex !== -1) {
      addProduct(filteredProducts[highlightIndex]);
    } else if (e.key === "Escape") {
      setHighlightIndex(-1);
    }
  };

  const addProduct = (product) => {
    if (!selectedProducts.some((p) => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setSearch("");
    setHighlightIndex(-1);
  };

  useEffect(() => {
    if (listRef.current && highlightIndex !== -1) {
      listRef.current.children[highlightIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightIndex]);

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
        onKeyDown={handleKeyDown}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {isLoading && <p className="text-blue-500 mt-2">Loading...</p>}
      {isError && <p className="text-red-500 mt-2">Error fetching data.</p>}

      {filteredProducts.length > 0 && (
        <ul
          ref={listRef}
          className="mt-2 border border-gray-200 rounded-md max-h-60 overflow-auto shadow-sm"
        >
          {filteredProducts.map((product, index) => (
            <li
              key={product.id}
              onClick={() => addProduct(product)}
              className={`p-3 cursor-pointer ${highlightIndex === index ? "bg-blue-100" : "hover:bg-blue-50"
                } transition duration-200`}
            >
              {product.title}
            </li>
          ))}
        </ul>
      )}

      {debouncedSearch && filteredProducts.length === 0 && (
        <p className="text-gray-500 mt-2">No results found</p>
      )}

      {selectedProducts.length > 0 && (
        <div className="mt-4 p-4 border border-gray-300 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold">Selected Products</h2>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {selectedProducts.map((product) => (
              <div key={product.id} className="border p-2 rounded-md shadow">
                <h3 className="text-md font-semibold">{product.title}</h3>
                <p className="text-gray-600">{product.category}</p>
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-20 h-20 object-cover mt-2 rounded-md"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;