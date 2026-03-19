# Техническое задание: Витрина физических артефактов

## 1. Описание проекта

Отдельное веб-приложение — публичная витрина интерактивных физических артефактов (Claude artifacts). Ученики могут просматривать и запускать интерактивные материалы без регистрации. Администраторы входят в систему для публикации и управления контентом.

---

## 2. Технологический стек

| Компонент | Технология |
|-----------|-----------|
| Frontend | React 19 + TypeScript |
| Bundler | Vite |
| Стилизация | Tailwind CSS 4 |
| Routing | React Router DOM v7 |
| Backend/DB | Firebase (Firestore + Auth + Storage) |
| Уведомления | React Hot Toast |
| Иконки | Lucide React |

---

## 3. Авторизация

### Принципы
- **Публичный доступ**: витрина полностью открыта, регистрация не требуется
- **Только администраторы** могут войти в систему, создавать и редактировать артефакты
- Нет регистрации для пользователей/учеников/учителей
- Firebase Auth используется **только для администраторов** (email/password или Google)

### Роли
| Роль | Возможности |
|------|------------|
| Гость (все) | Просмотр витрины, запуск артефактов |
| Администратор | Всё вышеперечисленное + создание/редактирование/удаление артефактов и метаданных |

### Реализация
- Список email-адресов администраторов хранится в Firestore (`admins` коллекция)
- После входа проверяем `currentUser.email` против списка администраторов
- `AdminRoute` компонент: если не авторизован — редирект на `/login`

---

## 4. Структура проекта

```
src/
├── components/
│   ├── showcase/
│   │   ├── ArtifactCard.tsx        # Карточка артефакта в сетке
│   │   ├── HierarchicalFilter.tsx  # Фильтрация: класс → четверть → раздел + теги
│   │   └── ImageUploader.tsx       # Загрузка изображений (drag&drop, paste)
│   ├── admin/
│   │   ├── AdminLayout.tsx         # Layout для admin-страниц
│   │   └── ArtifactEditForm.tsx    # Форма создания/редактирования артефакта
│   ├── modals/
│   │   ├── DeleteConfirmModal.tsx  # Подтверждение удаления
│   │   └── ArtifactPreviewModal.tsx # Предпросмотр артефакта по URL (в форме)
│   └── ui/
│       ├── Spinner.tsx
│       ├── SkeletonCard.tsx        # Skeleton для ArtifactCard при загрузке
│       └── ErrorState.tsx         # Общий компонент ошибки
├── pages/
│   ├── ShowcasePage.tsx            # Главная витрина (публичная)
│   ├── ArtifactDetailPage.tsx      # Полноэкранный просмотр артефакта
│   ├── LoginPage.tsx               # Страница входа для администраторов
│   └── admin/
│       ├── ArtifactsListPage.tsx   # Список всех артефактов
│       ├── ArtifactEditPage.tsx    # Обёртка: создание/редактирование
│       ├── SectionsPage.tsx        # CRUD разделов программы
│       └── TagsPage.tsx            # CRUD тегов
├── services/
│   ├── artifactGroupService.ts
│   ├── artifactService.ts
│   ├── storageService.ts
│   ├── sectionService.ts
│   └── tagService.ts
├── hooks/
│   ├── useArtifactGroups.ts
│   ├── useArtifacts.ts             # используется только на ArtifactDetailPage
│   ├── useSections.ts
│   └── useTags.ts
├── types/
│   └── artifact.types.ts
├── utils/
│   ├── artifactHelpers.ts
│   └── artifactUrl.ts
├── config/
│   ├── firebase.ts
│   └── constants.ts
└── App.tsx
```

---

## 5. Типы данных (TypeScript)

### ArtifactGroup

```typescript
interface ArtifactGroup {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;          // Firebase Storage download URL
  thumbnailPath?: string;      // Storage path — нужен для удаления
  isPublic: boolean;           // true = видно на витрине
  usesAI?: boolean;            // бейдж "AI powered"

  // Денормализованные данные вариантов — чтобы не грузить artifacts на витрине
  variantCount: number;        // количество вариантов
  variantLabels: string[];     // ["Тест", "Интерактив"] — для отображения на карточке

  // Иерархическая фильтрация
  grade?: number[];            // [7, 8, 9, 10, 11]
  quarter?: number;            // 1 | 2 | 3 | 4
  sectionId?: string;          // ref → sections

  tagIds: string[];            // ref[] → tags

  createdAt: Timestamp;        // обязательный — используется для сортировки
  updatedAt: Timestamp;
}
```

> **Денормализация**: поля `variantCount` и `variantLabels` дублируют данные из `artifacts`, но позволяют витрине загружать только `artifact_groups` без второго запроса. Обновляются синхронно при сохранении формы.

### Artifact

```typescript
interface Artifact {
  id: string;
  groupId: string;
  variantLabel: string;        // "Тест", "Интерактив", "Казакша" и т.д.
  embedUrl: string;            // UUID Claude artifact (только ID, не полный URL)
  description?: string;
  order: number;               // позиция в форме (0, 1, 2...)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Section

```typescript
interface Section {
  id: string;
  grade: number;               // 7–11
  quarter: number;             // 1–4
  label: string;               // "Колебания и волны"
  order: number;
}
```

### Tag

```typescript
interface Tag {
  id: string;
  label: string;               // "Конструктор", "Тест", "Игра"
  order: number;
}
```

---

## 6. Firestore — схема коллекций

| Коллекция | Описание |
|-----------|---------|
| `artifact_groups` | Основные группы/карточки артефактов |
| `artifacts` | Варианты артефактов (привязаны к группе) |
| `sections` | Разделы учебной программы |
| `tags` | Теги |
| `admins` | Email-адреса администраторов (doc ID = email) |

### Firestore правила безопасности

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /admins/{doc} {
      allow read: if request.auth != null;
      allow write: if false;
    }

    match /artifact_groups/{doc} {
      allow read: if true;
      allow write: if request.auth != null && isAdmin();
    }

    match /artifacts/{doc} {
      allow read: if true;
      allow write: if request.auth != null && isAdmin();
    }

    match /sections/{doc} {
      allow read: if true;
      allow write: if request.auth != null && isAdmin();
    }

    match /tags/{doc} {
      allow read: if true;
      allow write: if request.auth != null && isAdmin();
    }

    function isAdmin() {
      return exists(/databases/$(database)/documents/admins/$(request.auth.token.email));
    }
  }
}
```

### Firebase Storage правила безопасности

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /artifacts/{allPaths=**} {
      allow read: if true;
      allow write, delete: if request.auth != null;
    }
  }
}
```

---

## 7. Страницы приложения

### 7.1 ShowcasePage — публичная витрина

**Маршрут**: `/`

**Функциональность**:
- Загружает все `isPublic === true` группы одним `getDocs` запросом
- Все варианты (`artifacts`) **не загружаются** на этой странице — данные для карточек берутся из денормализованных полей `variantCount` / `variantLabels` на группе
- Фильтр сохраняется в URL query params (`?grade=8&quarter=2&section=abc&tags=id1,id2`) — при возврате с `ArtifactDetailPage` фильтр восстанавливается
- Фильтрация клиентская (вся коллекция уже в памяти)
- Пагинация отображения в памяти: показываем первые 24, затем +12 по кнопке
- Бейдж "Новое" если `createdAt > (now - 7 дней)`
- Skeleton-карточки во время загрузки
- Error state если Firestore недоступен
- Ссылка "Войти" для администраторов (мелко, в хедере)

**URL query params**:
```typescript
// Читаем и пишем через useSearchParams()
// ?grade=8&quarter=2&section=sectionId&tags=tagId1,tagId2
const [searchParams, setSearchParams] = useSearchParams();

const selectedGrade = Number(searchParams.get('grade')) || null;
const selectedQuarter = Number(searchParams.get('quarter')) || null;
const selectedSectionId = searchParams.get('section') || null;
const selectedTagIds = searchParams.get('tags')?.split(',').filter(Boolean) ?? [];

// При изменении фильтра:
function onGradeChange(grade: number | null) {
  setSearchParams(prev => {
    if (grade) prev.set('grade', String(grade)); else prev.delete('grade');
    prev.delete('quarter');   // сброс зависимых
    prev.delete('section');
    return prev;
  });
}
```

**Пагинация в памяти**:
```typescript
const INITIAL_PAGE_SIZE = 24;
const PAGE_SIZE = 12;

const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

// сброс при смене фильтра
useEffect(() => setVisibleCount(INITIAL_PAGE_SIZE), [selectedGrade, selectedQuarter, selectedSectionId, selectedTagIds]);

const visibleGroups = filteredGroups.slice(0, visibleCount);
const hasMore = visibleCount < filteredGroups.length;
```

**Макет**:
```
Header (логотип + "Войти")
├── HierarchicalFilter (sticky, z-20)
│   ├── Строка 1: [Класс: 7 8 9 10 11] → [Четверть: 1 2 3 4] → [Раздел: ...]
│   └── Строка 2: Теги (мультивыбор)
├── Счётчик результатов (если фильтр активен: "Найдено: 12")
├── Сетка ArtifactCard (1 / 2 / 3 / 4 колонки — responsive)
│   └── [SkeletonCard × 24] во время загрузки
├── Кнопка "Загрузить ещё" (если hasMore)
└── ErrorState (если ошибка загрузки)
```

---

### 7.2 ArtifactDetailPage — просмотр артефакта

**Маршрут**: `/artifacts/:id`

**Функциональность**:
- Загружает группу и её варианты (`artifacts`) параллельно — только здесь
- Вкладки вариантов (если больше одного)
- iframe занимает всё доступное пространство под хедером
- Кнопки: "Копировать ссылку" + "Открыть в новой вкладке"
- Кнопка "Назад" — возврат на витрину с сохранением фильтра (`/` + query params из `history.state` или `document.referrer`)
- Skeleton пока загружается группа
- Error state если группа не найдена или Firestore недоступен

**Макет**:
```
Header (фиксированный, ~56px)
├── Кнопка "← Назад"
├── Название артефакта (truncate)
└── Кнопки: Копировать | Открыть в новой вкладке

Вкладки вариантов (если > 1, ~44px)
├── [Тест] [Интерактив] [Казакша] ...

iframe
└── height: calc(100vh - 56px - 44px) // или 100vh - 56px если 1 вариант
    loading spinner поверх iframe пока не загрузился
    fallback кнопка "Открыть в новой вкладке" при ошибке iframe
```

---

### 7.3 LoginPage

**Маршрут**: `/login`

- Email + password форма
- После входа проверка email в `admins` → редирект на `/admin`
- Если не администратор — `signOut()` + сообщение об ошибке

---

### 7.4 Admin страницы

#### `/admin` — ArtifactsListPage

- Таблица всех групп (включая непубличные)
- Колонки: Название, Вариантов, Публичный, Дата создания, Действия
- Поиск по названию (текстовое поле, клиентская фильтрация)
- Переключатель публичности inline
- Кнопки "Редактировать" / "Удалить" — удаление открывает `DeleteConfirmModal`
- Пагинация: 20 строк, кнопки "← Назад" / "Вперёд →"

#### `/admin/artifacts/new` и `/admin/artifacts/:id` — ArtifactEditPage

Обёртка вокруг `ArtifactEditForm`. Кнопка предпросмотра варианта открывает `ArtifactPreviewModal`.

#### `/admin/sections` — SectionsPage

- CRUD разделов программы, сгруппированных по классу → четверти
- Поля: класс (7-11), четверть (1-4), название, порядок
- Удаление через `DeleteConfirmModal`

#### `/admin/tags` — TagsPage

- CRUD тегов
- Поля: название, порядок
- Инлайн редактирование, удаление через `DeleteConfirmModal`

---

## 8. Компоненты

### 8.1 ArtifactCard

```typescript
interface ArtifactCardProps {
  group: ArtifactGroup;
  showNewBadge: boolean;
}
```

**Отображение**:
- Thumbnail: Firebase Storage URL ИЛИ градиентный фон (deterministic по ID)
- Бейджи: "Новое" (emerald), "AI powered" (violet), класс (синий)
- Ссылки на варианты если `variantCount > 1`: "Тест · Интерактив"
- Клик → `/artifacts/{id}`
- Кнопка копирования ссылки — всегда видима (не только на hover), чтобы работала на тач-устройствах

**Gradient palette** (deterministic):
```typescript
const GRADIENTS = [
  'from-blue-400 to-indigo-600',
  'from-emerald-400 to-teal-600',
  'from-orange-400 to-rose-600',
  'from-violet-400 to-purple-600',
  'from-amber-400 to-orange-600',
  'from-pink-400 to-rose-600',
];
const gradient = GRADIENTS[group.id.charCodeAt(0) % GRADIENTS.length];
```

---

### 8.2 SkeletonCard

Компонент-заглушка с анимацией pulse, повторяет форму `ArtifactCard`. Отображается пока `loading === true` на витрине.

```typescript
// ShowcasePage:
{loading
  ? Array.from({ length: INITIAL_PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
  : visibleGroups.map(g => <ArtifactCard key={g.id} group={g} showNewBadge={...} />)
}
```

---

### 8.3 HierarchicalFilter

```typescript
interface HierarchicalFilterProps {
  sections: Section[];
  tags: Tag[];
  selectedGrade: number | null;
  selectedQuarter: number | null;
  selectedSectionId: string | null;
  selectedTagIds: string[];
  onGradeChange(v: number | null): void;
  onQuarterChange(v: number | null): void;
  onSectionChange(v: string | null): void;
  onTagIdsChange(v: string[]): void;
}
```

**Логика сброса**:
- Выбор класса → сбрасывает четверть и раздел
- Выбор четверти → сбрасывает раздел
- Разделы отображаются только если выбраны класс И четверть

**Мобильный UX**: каждая строка фильтров скроллится горизонтально (`overflow-x: auto`, `scrollbar-hide`). Элементы не переносятся на новую строку (`flex-nowrap`). На десктопе переносятся по необходимости.

---

### 8.4 ErrorState

```typescript
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}
```

Отображается при ошибке загрузки данных. Показывает сообщение и кнопку "Попробовать снова" если передан `onRetry`.

---

### 8.5 DeleteConfirmModal

```typescript
interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;           // название удаляемого объекта
  description?: string;    // доп. предупреждение (напр. "Удалятся все варианты")
  onConfirm(): void;
  onCancel(): void;
  isDeleting?: boolean;    // показывает spinner на кнопке подтверждения
}
```

Блокирует закрытие по клику вне модала пока `isDeleting === true`.

---

### 8.6 ArtifactPreviewModal

```typescript
interface ArtifactPreviewModalProps {
  isOpen: boolean;
  embedUrl: string;        // UUID или полный URL Claude artifact
  onClose(): void;
}
```

Используется в `ArtifactEditForm` — кнопка "Предпросмотр" рядом с полем URL варианта. Открывает iframe в модале, чтобы проверить что URL рабочий до сохранения.

---

### 8.7 ArtifactEditForm (в `components/admin/`)

```typescript
interface ArtifactEditFormProps {
  initialGroupId?: string;
  onSaveRedirect: string;
}
```

**Поля формы**:
1. Название (required)
2. Описание
3. Классы (мультивыбор: 7-11)
4. Четверть (1-4)
5. Раздел (фильтруется по классу + четверти)
6. Теги (мультивыбор)
7. Thumbnail (ImageUploader)
8. Публичный, usesAI (чекбоксы)
9. Варианты (повторяющиеся, до 5):
   - Метка варианта
   - URL артефакта Claude (валидация + кнопка "Предпросмотр" → `ArtifactPreviewModal`)
   - Описание варианта

**При сохранении**:
1. Валидировать все обязательные поля
2. Нормализовать URL артефактов (сохранять только UUID)
3. Создать/обновить документ группы (включая `variantCount`, `variantLabels`)
4. Создать/обновить документы вариантов
5. Каскадное удаление: удалить варианты, которых нет в форме

---

### 8.8 ImageUploader

```typescript
interface ImageUploaderProps {
  onUpload(url: string, storagePath: string): void;
  currentImageUrl?: string;
  onRemove?(): void;
}
```

- Drag & drop, выбор файла, Ctrl+V из буфера
- Ресайз до 600×400px на клиенте (canvas) перед загрузкой
- Загрузка в Firebase Storage с прогресс-баром
- Превью + кнопка удаления
- Валидация: только `image/*`, максимум 10MB

---

## 9. Сервисы

### artifactGroupService

```typescript
const artifactGroupService = {
  create(data): Promise<string>,
  getById(id): Promise<ArtifactGroup | null>,
  getAll(): Promise<ArtifactGroup[]>,
  getPublic(): Promise<ArtifactGroup[]>,
  update(id, data): Promise<void>,
  delete(id): Promise<void>,          // каскадное: Storage + Artifacts + Group
}
```

### artifactService

```typescript
const artifactService = {
  create(data): Promise<string>,
  getByGroupId(groupId): Promise<Artifact[]>,
  update(id, data): Promise<void>,
  delete(id): Promise<void>,
}
```

### storageService

```typescript
const storageService = {
  async upload(file: Blob): Promise<{ url: string; path: string }>,
  async delete(path: string): Promise<void>,  // deleteObject — без Cloud Functions
}
```

### sectionService, tagService

Стандартный CRUD: `create`, `getAll`, `update`, `delete`.

---

## 10. Хуки

`onSnapshot` не используется нигде — только `getDocs`. Экономит лимит Firestore.

### useArtifactGroups — используется на ShowcasePage и в admin

Загружает все группы одним запросом. Фильтрация и пагинация — в компоненте.

```typescript
function useArtifactGroups({ publicOnly = false } = {}) {
  const [groups, setGroups] = useState<ArtifactGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const q = publicOnly
      ? query(collection(db, 'artifact_groups'), where('isPublic', '==', true))
      : collection(db, 'artifact_groups');
    getDocs(q)
      .then(snap => {
        setGroups(
          snap.docs
            .map(d => ({ id: d.id, ...d.data() } as ArtifactGroup))
            .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
        );
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [publicOnly]);

  useEffect(() => { load(); }, [load]);

  return { groups, loading, error, reload: load };
}
```

### useArtifacts — используется только на ArtifactDetailPage

```typescript
function useArtifacts(groupId: string) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    artifactService.getByGroupId(groupId)
      .then(data => setArtifacts(data.sort((a, b) => a.order - b.order)))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [groupId]);

  return { artifacts, loading, error };
}
```

> **Admin**: после создания/редактирования/удаления — редирект на `/admin`, который при маунте делает свежий `getDocs`.

---

## 11. Утилиты

### artifactUrl.ts

```typescript
// Поддерживаемые форматы входного URL:
// - "abc-123-def-456" (чистый UUID)
// - "https://claude.ai/public/artifacts/abc-123-def-456"
// - "https://claude.site/public/artifacts/abc-123-def-456/embed"

function extractArtifactId(url: string): string | null
function getEmbedUrl(urlOrId: string): string   // → https://claude.site/public/artifacts/{id}/embed
function getViewUrl(urlOrId: string): string    // → https://claude.ai/public/artifacts/{id}
function normalizeArtifactUrl(url: string): string
function isValidArtifactUrl(url: string): boolean
```

### artifactHelpers.ts

```typescript
function normalizeArtifactGroup(raw: any): ArtifactGroup {
  return {
    ...raw,
    grade: raw.grade ?? [],
    tagIds: raw.tagIds ?? [],
    variantCount: raw.variantCount ?? 0,
    variantLabels: raw.variantLabels ?? [],
  };
}
```

### constants.ts

```typescript
export const GRADES = [7, 8, 9, 10, 11];
export const QUARTERS = [1, 2, 3, 4];
export const NEW_ARTIFACT_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 дней
export const INITIAL_PAGE_SIZE = 24;  // витрина: первая порция
export const PAGE_SIZE = 12;          // витрина: каждая следующая
export const ADMIN_PAGE_SIZE = 20;    // admin: строк на страницу
```

---

## 12. Маршруты

```typescript
<Routes>
  <Route path="/" element={<ShowcasePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/artifacts/:id" element={<ArtifactDetailPage />} />

  <Route element={<AdminRoute />}>
    <Route path="/admin" element={<ArtifactsListPage />} />
    <Route path="/admin/artifacts/new" element={<ArtifactEditPage />} />
    <Route path="/admin/artifacts/:id" element={<ArtifactEditPage />} />
    <Route path="/admin/sections" element={<SectionsPage />} />
    <Route path="/admin/tags" element={<TagsPage />} />
  </Route>
</Routes>
```

---

## 13. Аутентификация (AuthContext)

```typescript
interface AuthContextValue {
  user: FirebaseUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

async function checkIsAdmin(email: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'admins', email));
  return snap.exists();
}
```

---

## 14. Конфигурация Firebase

```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

**Бесплатные лимиты Firebase (Spark план)**:

| Сервис | Лимит |
|--------|-------|
| Firestore reads | 50 000 / день |
| Firestore writes | 20 000 / день |
| Storage | 5 GB, 1 GB/день downloads |
| Auth | без лимита |

---

## 15. Паттерны и практики

### Денормализация вариантов
При сохранении формы синхронно обновляем `variantCount` и `variantLabels` на группе. Это позволяет витрине работать с одним запросом к `artifact_groups`.

### Нормализация URL артефактов
Хранить только UUID, не полный URL. Полные URL генерировать из ID при отображении.

### Каскадное удаление
```typescript
async delete(groupId: string): Promise<void> {
  const group = await artifactGroupService.getById(groupId);
  if (group?.thumbnailPath) {
    await storageService.delete(group.thumbnailPath);
  }
  const artifacts = await artifactService.getByGroupId(groupId);
  await Promise.all(artifacts.map(a => artifactService.delete(a.id)));
  await deleteDoc(doc(db, 'artifact_groups', groupId));
}
```

### Переключение вариантов (iframe)
```typescript
// key = ID артефакта → гарантирует перемонтирование при смене варианта
<iframe key={currentArtifact.id} src={getEmbedUrl(currentArtifact.embedUrl)} />
```

### Детерминированные градиенты
```typescript
const gradient = GRADIENTS[group.id.charCodeAt(0) % GRADIENTS.length];
```

### Мемоизация фильтрации
```typescript
const filteredGroups = useMemo(() => {
  return groups
    .filter(g => !selectedGrade || g.grade?.includes(selectedGrade))
    .filter(g => !selectedQuarter || g.quarter === selectedQuarter)
    .filter(g => !selectedSectionId || g.sectionId === selectedSectionId)
    .filter(g => selectedTagIds.length === 0 || selectedTagIds.some(id => g.tagIds.includes(id)));
}, [groups, selectedGrade, selectedQuarter, selectedSectionId, selectedTagIds]);
```

---

## 16. Минимальный порядок разработки

1. **Настройка проекта**: Vite + React + TypeScript + Tailwind + Firebase
2. **Типы и константы**: `artifact.types.ts`, `constants.ts`
3. **Firebase**: конфиг, правила Firestore и Storage, коллекция `admins`
4. **Auth**: `AuthContext`, `LoginPage`, `AdminRoute`
5. **Сервисы**: все 5 сервисов
6. **Хуки**: `useArtifactGroups`, `useArtifacts`, `useSections`, `useTags`
7. **Утилиты**: `artifactUrl.ts`, `artifactHelpers.ts`
8. **UI компоненты**: `Spinner`, `SkeletonCard`, `ErrorState`
9. **Модальные окна**: `DeleteConfirmModal`, `ArtifactPreviewModal`
10. **Showcase компоненты**: `ArtifactCard`, `HierarchicalFilter`
11. **Admin компоненты**: `ImageUploader`, `ArtifactEditForm`
12. **Публичные страницы**: `ShowcasePage`, `ArtifactDetailPage`
13. **Admin страницы**: `ArtifactsListPage`, `ArtifactEditPage`, `SectionsPage`, `TagsPage`
14. **Деплой**: Firebase Hosting

---

## 17. Что убрано по сравнению с оригиналом

- **Cloudinary** — заменён на Firebase Storage
- **`viewCount`** — убран полностью
- **`onSnapshot`** — только `getDocs`
- **`isFeatured`**, **`order`** на группах — убраны
- **`modeId`**, **`topicId`** — устаревшие поля, заменены `sectionId` + `tagIds`
- **Коллекции `modes`, `topics`** и их admin-страницы
- **`CategoryRow`**, **`HeroCarousel`** (netflix-стиль)
- **`ArtifactEmbedPage`** — отдельная embed-страница
- **Авторизация пользователей/учителей** — только admin
- **Весь функционал журналов, классов, учеников**
