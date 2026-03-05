import { beforeEach, describe, expect, it } from "vitest";
import {
  clearFavorites,
  getFavorites,
  removeFavorite,
  toggleFavorite,
} from "./favorites";

beforeEach(() => {
  localStorage.clear();
});

describe("favorites utils", () => {
  it("começa vazio", () => {
    expect(getFavorites()).toEqual([]);
  });

  it("toggleFavorite adiciona e remove pelo mesmo id", () => {
    toggleFavorite({
      id: 1,
      title: "Batman",
      year: "2022",
      image: "",
      genres: ["Action"],
      rating: 8.5,
    });

    expect(getFavorites().length).toBe(1);

    // chamar de novo com mesmo id remove
    toggleFavorite({
      id: 1,
      title: "Batman (qualquer texto aqui)",
    });

    expect(getFavorites()).toEqual([]);
  });

  it("removeFavorite remove por id", () => {
    toggleFavorite({ id: 1, title: "A" });
    toggleFavorite({ id: 2, title: "B" });

    expect(getFavorites().length).toBe(2);

    removeFavorite(1);

    const favs = getFavorites();
    expect(favs.length).toBe(1);
    expect(favs[0].id).toBe(2);
  });

  it("clearFavorites limpa tudo", () => {
    toggleFavorite({ id: 1, title: "A" });
    toggleFavorite({ id: 2, title: "B" });

    expect(getFavorites().length).toBe(2);

    clearFavorites();

    expect(getFavorites()).toEqual([]);
  });
});
