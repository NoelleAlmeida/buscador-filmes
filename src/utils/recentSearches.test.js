import { beforeEach, describe, expect, it } from "vitest";
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
} from "./recentSearches";

beforeEach(() => {
  localStorage.clear();
});

describe("recentSearches utils", () => {
  it("começa vazio", () => {
    expect(getRecentSearches()).toEqual([]);
  });

  it("addRecentSearch adiciona e não duplica (case-insensitive)", () => {
    addRecentSearch("batman");
    addRecentSearch("Batman");
    addRecentSearch("BATMAN");

    const list = getRecentSearches();
    expect(list.length).toBe(1);
    expect(list[0]).toBe("BATMAN"); // último termo ganha (fica no topo)
  });

  it("mantém no máximo 8 itens", () => {
    for (let i = 1; i <= 12; i++) {
      addRecentSearch(`busca${i}`);
    }
    const list = getRecentSearches();
    expect(list.length).toBe(8);
    expect(list[0]).toBe("busca12");
    expect(list[7]).toBe("busca5");
  });

  it("clearRecentSearches limpa", () => {
    addRecentSearch("batman");
    expect(getRecentSearches().length).toBe(1);

    clearRecentSearches();
    expect(getRecentSearches()).toEqual([]);
  });
});
