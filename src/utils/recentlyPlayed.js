const KEY = "recentlyPlayed";

export function saveRecentlyPlayed(item) {
  let list = JSON.parse(localStorage.getItem(KEY) || "[]");

  list = list.filter(x => x.id !== item.id);

  list.unshift(item);

  if (list.length > 5) {
    list = list.slice(0, 5);
  }

  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getRecentlyPlayed() {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}
