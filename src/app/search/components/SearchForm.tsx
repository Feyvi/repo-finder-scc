"use client";

import React from "react";
import CreatableSelect from "react-select/creatable";
import type { MultiValue } from "react-select";
import { toOptions, LANGUAGES } from "../utils";
import { selectStyles } from "./selectStyles";

type Option = { value: string; label: string };

interface Props {
  input: string;
  setInput: (v: string) => void;
  selectedOptions: Option[];
  setSelectedOptions: (v: Option[]) => void;
  minStars: string;
  setMinStars: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  onSearch: () => void;
}

export default function SearchForm({
  input,
  setInput,
  selectedOptions,
  setSelectedOptions,
  minStars,
  setMinStars,
  sort,
  setSort,
  onSearch,
}: Props) {
  const nativeField =
    "w-full border border-gray-300 rounded-md px-3 h-11 flex items-center text-black bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-100";
  return (
    <>
      <div className="grid gap-3 grid-cols-1 md:grid-cols-5 mb-7">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`${nativeField} col-span-2`}
          placeholder="Введите название проекта"
          aria-label="Поиск по названию проекта"
        />

        <div className="col-span-1 md:col-span-1">
          <CreatableSelect
            isMulti
            options={toOptions(LANGUAGES)}
            value={selectedOptions}
            onChange={(v: MultiValue<Option>) => {
              const arr = (v || []).map((it) => ({
                value: it.value,
                label: it.label,
              }));
              setSelectedOptions(arr);
            }}
            className="w-full"
            classNamePrefix="react-select"
            placeholder="Языки (участвуют в коде)"
            noOptionsMessage={() => "Ничего не найдено"}
            formatCreateLabel={(inputValue) => `Добавить: "${inputValue}"`}
            styles={selectStyles}
            aria-label="Фильтр по языкам"
          />
        </div>

        <input
          value={minStars}
          onChange={(e) => setMinStars(e.target.value)}
          className={`${nativeField}`}
          placeholder="Минимум звёзд"
          aria-label="Минимум звёзд"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className={`${nativeField}`}
          aria-label="Сортировка"
        >
          <option value="">Без сортировки</option>
          <option value="stars">По звёздам</option>
          <option value="name">По названию</option>
        </select>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={onSearch}
          className="bg-blue-600 text-white px-6 py-2 rounded-md transition-colors duration-300 hover:bg-blue-700 h-11 flex items-center"
        >
          Найти
        </button>
      </div>
    </>
  );
}
