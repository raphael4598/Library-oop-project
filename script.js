/* =========================================================================
   ระบบจัดการห้องสมุด (Library Management System)
   Mini Project — Object-Oriented Programming

   หลักการ OOP ที่ใช้ในไฟล์นี้ (สำหรับตอนนำเสนอ ให้ชี้บรรทัด/เมธอดตามนี้ได้เลย):
     - Encapsulation : ทุกคลาสเก็บฟิลด์เป็น private ด้วย # แล้วเข้าถึงผ่าน
                        getter / method เท่านั้น (ดูคลาส Person, Book, Loan)
     - Inheritance   : Member, Librarian สืบทอดจาก Person
                        EBook สืบทอดจาก Book
     - Polymorphism  : describe() ถูก override ใน Member และ Librarian
                        checkOut() / getType() ถูก override ใน EBook
   ========================================================================= */

/* -------------------------------------------------------------------------
   1) Person — คลาสฐาน (base class) ที่ Member และ Librarian จะสืบทอดไป
   ------------------------------------------------------------------------- */
class Person {
  // Encapsulation: ฟิลด์ private ด้วย # เข้าถึงจากภายนอกไม่ได้โดยตรง
  #name;
  #personId;

  constructor(name, personId) {
    if (new.target === Person) {
      // กันไม่ให้สร้าง Person ตรง ๆ (ใช้เป็นฐานเท่านั้น) — แนวคิด Abstraction
      throw new Error("Person เป็นคลาสฐาน ห้ามสร้างอินสแตนซ์ตรง ๆ");
    }
    this.#name = name;
    this.#personId = personId;
  }

  // getter สาธารณะ (public interface) สำหรับอ่านค่า private field
  get name() {
    return this.#name;
  }
  get id() {
    return this.#personId;
  }

  // เมธอดนี้จะถูก "override" ในคลาสลูกแต่ละคลาส -> Polymorphism
  describe() {
    return `บุคคล: ${this.#name} (${this.#personId})`;
  }
}

/* -------------------------------------------------------------------------
   2) Member — สมาชิกห้องสมุด (สืบทอดจาก Person)  -> Inheritance
   ------------------------------------------------------------------------- */
class Member extends Person {
  #maxBooks;
  #borrowedBookIds;

  constructor(name, personId, maxBooks = 3) {
    super(name, personId); // เรียก constructor ของคลาสแม่
    this.#maxBooks = maxBooks;
    this.#borrowedBookIds = [];
  }

  get borrowedCount() {
    return this.#borrowedBookIds.length;
  }
  get maxBooks() {
    return this.#maxBooks;
  }
  get borrowedBookIds() {
    return [...this.#borrowedBookIds]; // คืนสำเนา ป้องกันแก้ไขจากภายนอก
  }

  canBorrow() {
    return this.#borrowedBookIds.length < this.#maxBooks;
  }

  addBorrowed(isbn) {
    this.#borrowedBookIds.push(isbn);
  }

  removeBorrowed(isbn) {
    this.#borrowedBookIds = this.#borrowedBookIds.filter((x) => x !== isbn);
  }

  // Polymorphism: override เมธอดของ Person ให้พฤติกรรมต่างออกไป
  describe() {
    return `สมาชิก: ${this.name} (รหัส ${this.id}) — ยืมอยู่ ${this.borrowedCount}/${this.#maxBooks} เล่ม`;
  }
}

/* -------------------------------------------------------------------------
   3) Librarian — บรรณารักษ์ (สืบทอดจาก Person) -> Inheritance
   ------------------------------------------------------------------------- */
class Librarian extends Person {
  #staffCode;

  constructor(name, personId, staffCode) {
    super(name, personId);
    this.#staffCode = staffCode;
  }

  get staffCode() {
    return this.#staffCode;
  }

  // Polymorphism: override เมธอดเดียวกัน แต่คืนข้อความคนละแบบกับ Member
  describe() {
    return `บรรณารักษ์: ${this.name} (รหัสพนักงาน ${this.#staffCode})`;
  }
}

/* -------------------------------------------------------------------------
   4) Book — หนังสือเล่มจริง (คลาสฐานสำหรับ EBook)
   ------------------------------------------------------------------------- */
class Book {
  #isbn;
  #title;
  #author;
  #totalCopies;
  #availableCopies;

  constructor(isbn, title, author, totalCopies = 1) {
    this.#isbn = isbn;
    this.#title = title;
    this.#author = author;
    this.#totalCopies = totalCopies;
    this.#availableCopies = totalCopies;
  }

  get isbn() {
    return this.#isbn;
  }
  get title() {
    return this.#title;
  }
  get author() {
    return this.#author;
  }
  get totalCopies() {
    return this.#totalCopies;
  }
  get availableCopies() {
    return this.#availableCopies;
  }

  // เพิ่ม/ลดจำนวนเล่มที่มีให้ยืม — encapsulation: ภายนอกแก้เลขนี้ตรง ๆ ไม่ได้
  addCopies(n) {
    this.#totalCopies += n;
    this.#availableCopies += n;
  }

  // จะถูก override ใน EBook -> Polymorphism
  checkOut() {
    if (this.#availableCopies <= 0) return false;
    this.#availableCopies -= 1;
    return true;
  }

  checkIn() {
    if (this.#availableCopies < this.#totalCopies) {
      this.#availableCopies += 1;
    }
  }

  // จะถูก override ใน EBook -> Polymorphism
  getType() {
    return "หนังสือเล่ม";
  }
}

/* -------------------------------------------------------------------------
   5) EBook — หนังสืออิเล็กทรอนิกส์ (สืบทอดจาก Book) -> Inheritance
      ยืมได้พร้อมกันไม่จำกัดคน (ไม่ต้องรอคิว) -> override พฤติกรรม checkOut()
   ------------------------------------------------------------------------- */
class EBook extends Book {
  #fileFormat;

  constructor(isbn, title, author, fileFormat = "PDF") {
    super(isbn, title, author, Infinity); // ebook ไม่จำกัดสำเนา
    this.#fileFormat = fileFormat;
  }

  get fileFormat() {
    return this.#fileFormat;
  }

  // Polymorphism: override checkOut — อีบุ๊กยืมได้เสมอ ไม่ลดจำนวนสำเนา
  checkOut() {
    return true;
  }

  checkIn() {
    // ไม่มีสำเนาต้องคืนจริง แต่ต้อง override ไว้เพื่อไม่ให้พฤติกรรมของ Book ทำงานผิด
  }

  // Polymorphism: override getType
  getType() {
    return `อีบุ๊ก (${this.#fileFormat})`;
  }
}

/* -------------------------------------------------------------------------
   6) Loan — ใบยืมหนึ่งรายการ เชื่อม Member กับ Book เข้าด้วยกัน
   ------------------------------------------------------------------------- */
class Loan {
  static #FINE_PER_DAY = 5; // บาท/วัน

  #loanId;
  #book;
  #member;
  #borrowDate;
  #dueDate;
  #returnDate;

  constructor(loanId, book, member, loanDays = 7) {
    this.#loanId = loanId;
    this.#book = book;
    this.#member = member;
    this.#borrowDate = new Date();
    this.#dueDate = new Date();
    this.#dueDate.setDate(this.#borrowDate.getDate() + loanDays);
    this.#returnDate = null;
  }

  get loanId() {
    return this.#loanId;
  }
  get book() {
    return this.#book;
  }
  get member() {
    return this.#member;
  }
  get borrowDate() {
    return this.#borrowDate;
  }
  get dueDate() {
    return this.#dueDate;
  }
  get returnDate() {
    return this.#returnDate;
  }
  get isReturned() {
    return this.#returnDate !== null;
  }

  isOverdue() {
    if (this.isReturned) return false;
    return new Date() > this.#dueDate;
  }

  // คำนวณค่าปรับจากจำนวนวันที่เกินกำหนด
  calculateFine() {
    const endDate = this.#returnDate ?? new Date();
    const diffMs = endDate - this.#dueDate;
    if (diffMs <= 0) return 0;
    const daysLate = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return daysLate * Loan.#FINE_PER_DAY;
  }

  markReturned() {
    this.#returnDate = new Date();
  }
}

/* -------------------------------------------------------------------------
   7) Library — คลาสควบคุมระบบทั้งหมด (Aggregation: "มี" Book, Member, Loan)
      รวม logic การยืม-คืนไว้ที่เดียว และเรียกใช้เมธอด polymorphic ของ Book
   ------------------------------------------------------------------------- */
class Library {
  #books;
  #members;
  #loans;
  #nextLoanId;

  constructor(name) {
    this.name = name;
    this.#books = new Map(); // isbn -> Book
    this.#members = new Map(); // id -> Member
    this.#loans = new Map(); // loanId -> Loan
    this.#nextLoanId = 1;
  }

  // ---- หนังสือ ----
  addBook(book) {
    this.#books.set(book.isbn, book);
    return book;
  }

  removeBook(isbn) {
    return this.#books.delete(isbn);
  }

  getBooks() {
    return [...this.#books.values()];
  }

  searchBooks(keyword) {
    const k = keyword.trim().toLowerCase();
    if (!k) return this.getBooks();
    return this.getBooks().filter(
      (b) =>
        b.title.toLowerCase().includes(k) ||
        b.author.toLowerCase().includes(k) ||
        b.isbn.toLowerCase().includes(k)
    );
  }

  // ---- สมาชิก ----
  registerMember(member) {
    this.#members.set(member.id, member);
    return member;
  }

  getMembers() {
    return [...this.#members.values()];
  }

  // ---- ยืม/คืน ----
  borrowBook(memberId, isbn) {
    const member = this.#members.get(memberId);
    const book = this.#books.get(isbn);
    if (!member) throw new Error("ไม่พบสมาชิกนี้");
    if (!book) throw new Error("ไม่พบหนังสือเล่มนี้");
    if (!member.canBorrow()) throw new Error("สมาชิกยืมครบจำนวนสูงสุดแล้ว");

    // เรียก checkOut() แบบ polymorphic — ไม่สนใจว่าเป็น Book หรือ EBook
    // แต่ละคลาสรู้วิธี "ยืม" ของตัวเอง
    const ok = book.checkOut();
    if (!ok) throw new Error("หนังสือเล่มนี้ถูกยืมหมดแล้ว");

    const loan = new Loan(this.#nextLoanId++, book, member);
    this.#loans.set(loan.loanId, loan);
    member.addBorrowed(isbn);
    return loan;
  }

  returnBook(loanId) {
    const loan = this.#loans.get(loanId);
    if (!loan) throw new Error("ไม่พบรายการยืมนี้");
    if (loan.isReturned) throw new Error("รายการนี้คืนแล้ว");

    const fine = loan.calculateFine();
    loan.markReturned();
    loan.book.checkIn(); // polymorphic เช่นกัน
    loan.member.removeBorrowed(loan.book.isbn);
    return fine;
  }

  getActiveLoans() {
    return [...this.#loans.values()].filter((l) => !l.isReturned);
  }

  getAllLoans() {
    return [...this.#loans.values()];
  }

  getStats() {
    const totalBooks = this.getBooks().length;
    const totalMembers = this.getMembers().length;
    const activeLoans = this.getActiveLoans().length;
    const overdue = this.getActiveLoans().filter((l) => l.isOverdue()).length;
    return { totalBooks, totalMembers, activeLoans, overdue };
  }
}

/* =========================================================================
   ต่อจากนี้คือส่วนควบคุมหน้าจอ (GUI wiring) — ไม่เกี่ยวกับ OOP model ด้านบน
   ========================================================================= */

const library = new Library("ห้องสมุดคณะวิศวกรรมศาสตร์");

// ---------- persistence (localStorage, per-viewer, best-effort) ----------
const STORAGE_KEY = "library-oop-demo-v1";

function loadSeedData() {
  library.addBook(new Book("978-0-13-468599-1", "Clean Code", "Robert C. Martin", 2));
  library.addBook(new Book("978-0-596-00712-6", "Head First Design Patterns", "Freeman & Robson", 1));
  library.addBook(new EBook("978-1-491-95035-7", "Learning JavaScript", "Ethan Brown"));
  library.registerMember(new Member("ณัฐวุฒิ ใจดี", "M001"));
  library.registerMember(new Member("พิมพ์ชนก แสงทอง", "M002"));
  library.registerMember(new Librarian("อาจารย์สมชาย", "L001", "STF-01"));
}

function trySaveState() {
  try {
    const data = {
      books: library.getBooks().map((b) => ({
        isbn: b.isbn,
        title: b.title,
        author: b.author,
        total: b.totalCopies === Infinity ? -1 : b.totalCopies,
        available: b.availableCopies === Infinity ? -1 : b.availableCopies,
        isEbook: b.getType().startsWith("อีบุ๊ก"),
        format: b instanceof EBook ? b.fileFormat : null,
      })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // localStorage อาจใช้ไม่ได้ในบางสภาพแวดล้อม — ไม่เป็นไร ระบบยังทำงานได้ในเซสชันนี้
    console.warn("บันทึกข้อมูลถาวรไม่สำเร็จ:", e);
  }
}

loadSeedData();

// ---------- tab navigation ----------
const tabs = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll(".panel");
tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((b) => b.classList.remove("active"));
    panels.forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.target).classList.add("active");
    renderAll();
  });
});

// ---------- rendering ----------
function fmtDate(d) {
  if (!d) return "-";
  return d.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit" });
}

function renderStats() {
  const s = library.getStats();
  document.getElementById("stat-books").textContent = s.totalBooks;
  document.getElementById("stat-members").textContent = s.totalMembers;
  document.getElementById("stat-loans").textContent = s.activeLoans;
  document.getElementById("stat-overdue").textContent = s.overdue;
}

function renderBooks(filter = "") {
  const list = document.getElementById("book-list");
  const books = filter ? library.searchBooks(filter) : library.getBooks();
  list.innerHTML = "";
  if (books.length === 0) {
    list.innerHTML = `<li class="empty">ไม่พบหนังสือ</li>`;
    return;
  }
  books.forEach((b) => {
    const li = document.createElement("li");
    li.className = "card-row";
    const avail = b.availableCopies === Infinity ? "ไม่จำกัด" : `${b.availableCopies}/${b.totalCopies}`;
    li.innerHTML = `
      <div class="row-main">
        <span class="row-title">${b.title}</span>
        <span class="row-sub">${b.author} · ${b.getType()} · ISBN ${b.isbn}</span>
      </div>
      <div class="row-meta">
        <span class="pill ${b.availableCopies > 0 ? "pill-ok" : "pill-warn"}">ว่าง ${avail}</span>
        <button class="icon-btn" data-action="del-book" data-isbn="${b.isbn}" title="ลบหนังสือ">ลบ</button>
      </div>`;
    list.appendChild(li);
  });
}

function renderMembers() {
  const list = document.getElementById("member-list");
  list.innerHTML = "";
  const members = library.getMembers();
  if (members.length === 0) {
    list.innerHTML = `<li class="empty">ยังไม่มีสมาชิก</li>`;
    return;
  }
  members.forEach((m) => {
    const li = document.createElement("li");
    li.className = "card-row";
    // เรียก describe() เดียวกัน แต่ได้ข้อความต่างกันตามชนิดจริง (Member/Librarian) -> Polymorphism
    li.innerHTML = `<div class="row-main"><span class="row-title">${m.describe()}</span></div>`;
    list.appendChild(li);
  });
}

function populateSelects() {
  const memberSel = document.getElementById("select-member");
  const bookSel = document.getElementById("select-book");
  memberSel.innerHTML = library
    .getMembers()
    .filter((m) => m instanceof Member) // บรรณารักษ์ไม่ยืมหนังสือในระบบนี้
    .map((m) => `<option value="${m.id}">${m.name} (${m.id})</option>`)
    .join("");
  bookSel.innerHTML = library
    .getBooks()
    .map((b) => `<option value="${b.isbn}">${b.title}</option>`)
    .join("");
}

function renderLoans() {
  const list = document.getElementById("loan-list");
  list.innerHTML = "";
  const loans = library.getActiveLoans();
  if (loans.length === 0) {
    list.innerHTML = `<li class="empty">ไม่มีรายการยืมค้างอยู่</li>`;
    return;
  }
  loans.forEach((l) => {
    const li = document.createElement("li");
    li.className = "card-row";
    const overdue = l.isOverdue();
    li.innerHTML = `
      <div class="row-main">
        <span class="row-title">${l.book.title}</span>
        <span class="row-sub">${l.member.name} · ยืม ${fmtDate(l.borrowDate)} · กำหนดคืน ${fmtDate(l.dueDate)}</span>
      </div>
      <div class="row-meta">
        ${overdue ? `<span class="pill pill-warn">เกินกำหนด</span>` : `<span class="pill pill-ok">ปกติ</span>`}
        <button class="icon-btn" data-action="return-loan" data-loan="${l.loanId}">คืนหนังสือ</button>
      </div>`;
    list.appendChild(li);
  });
}

function renderAll() {
  renderStats();
  renderBooks(document.getElementById("book-search").value);
  renderMembers();
  populateSelects();
  renderLoans();
}

// ---------- form handlers ----------
document.getElementById("form-add-book").addEventListener("submit", (e) => {
  e.preventDefault();
  const isbn = document.getElementById("f-isbn").value.trim();
  const title = document.getElementById("f-title").value.trim();
  const author = document.getElementById("f-author").value.trim();
  const copies = parseInt(document.getElementById("f-copies").value, 10) || 1;
  const isEbook = document.getElementById("f-is-ebook").checked;
  if (!isbn || !title || !author) return;

  const book = isEbook ? new EBook(isbn, title, author) : new Book(isbn, title, author, copies);
  library.addBook(book);
  e.target.reset();
  document.getElementById("f-copies").value = 1;
  trySaveState();
  renderAll();
});

document.getElementById("book-search").addEventListener("input", (e) => {
  renderBooks(e.target.value);
});

document.getElementById("book-list").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action='del-book']");
  if (!btn) return;
  library.removeBook(btn.dataset.isbn);
  trySaveState();
  renderAll();
});

document.getElementById("form-add-member").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("m-name").value.trim();
  const id = document.getElementById("m-id").value.trim();
  const max = parseInt(document.getElementById("m-max").value, 10) || 3;
  if (!name || !id) return;
  library.registerMember(new Member(name, id, max));
  e.target.reset();
  document.getElementById("m-max").value = 3;
  renderAll();
});

document.getElementById("form-borrow").addEventListener("submit", (e) => {
  e.preventDefault();
  const msgEl = document.getElementById("borrow-msg");
  const memberId = document.getElementById("select-member").value;
  const isbn = document.getElementById("select-book").value;
  if (!memberId || !isbn) return;
  try {
    library.borrowBook(memberId, isbn);
    msgEl.textContent = "ยืมสำเร็จ";
    msgEl.className = "form-msg ok";
  } catch (err) {
    msgEl.textContent = err.message;
    msgEl.className = "form-msg error";
  }
  trySaveState();
  renderAll();
});

document.getElementById("loan-list").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action='return-loan']");
  if (!btn) return;
  try {
    const fine = library.returnBook(parseInt(btn.dataset.loan, 10));
    const msgEl = document.getElementById("borrow-msg");
    msgEl.textContent = fine > 0 ? `รับคืนแล้ว — ค่าปรับ ${fine} บาท` : "รับคืนแล้ว ไม่มีค่าปรับ";
    msgEl.className = "form-msg ok";
  } catch (err) {
    console.error(err);
  }
  trySaveState();
  renderAll();
});

renderAll();
