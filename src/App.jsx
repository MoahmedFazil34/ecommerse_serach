import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import SearchComponent from "./SearchComponent";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SearchComponent />
    </QueryClientProvider>
  );
}

export default App;
