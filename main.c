#include <stdio.h>
#include <stdlib.h>

//definicje do testów na 5.0
#define N1 1
#define N2 2
#define N3 3
#define N4 4
#define N5 5

//struktury do testowania sizeof
struct S1 { double d; char tab[N1]; int m; };
struct S2 { double d; char tab[N2]; int m; };
struct S3 { double d; char tab[N3]; int m; };
struct S4 { double d; char tab[N4]; int m; };
struct S5 { double d; char tab[N5]; int m; };



// definicja typu strukturalnego (można podać obie postacie i korzystać później z jednej z nich)
// 3.a bez użycia typedef
struct Wyklady {
    char* przedmiot;
    char* temat;
};

// 3.b z użyciem typedef
typedef struct {
    char* imie;
    char* nazwisko;
    int wiek;
    double srednia;
} Student;

// 5.1.a deklaracja funkcji fun_strukt
void fun_struct(Student s);

// 5.3.a deklaracja funkcji fun_strukt_out
Student fun_struct_out(Student s);

// 5.5.a deklaracja funkcji fun_strukt_wsk
void fun_struct_wsk(Student* wsk);

Student fun_struct_wsk_kopia(Student* wsk);

void fun_struct_wsk_inout(Student* wsk);

Student* fun_struct_wsk_out(Student s);

int main (void)
{

  // 4.1 definicja zmiennej (np. obiekt_1) typu strukturalnego
  Student s1;

  // 4.2 nadanie wartości pól zmiennej obiekt_1 z pomocą operatora .
  s1.imie = "Adam";
  s1.nazwisko = "Ziemniak";
  s1.wiek = 20;
  s1.srednia = 4.0;

  // 4.3 wypisanie wartości pól zmiennej obiekt_1 z pomocą operatora .
  //    np. printf("Początkowe wartości pól obiekt_1: ....", ....);
  
  printf("\nImie: %s, Nazwisko: %s, Wiek: %d lat, Średnia: %lf\n", s1.imie, s1.nazwisko, s1.wiek, s1.srednia);

  // 5.2.1 wywołanie funkcji fun_strukt (po deklaracji w p. 5.1.a i definicji w p. 5.1.b)
  //      z obiektem 1 jako argumentem 
  fun_struct(s1);

  // 5.2.2 wypisanie wartości pól zmiennej obiekt_1 z pomocą operatora .
  //    np. printf("Po wywołaniu fun_strukt - wartości pól obiekt_1: ....", ....);
  
  printf("\nPo powrocie z fun_struct: Imie: %s, Nazwisko: %s, Wiek: %d lat, Średnia: %lf\n", s1.imie, s1.nazwisko, s1.wiek, s1.srednia);

  // 5.4.1 wywołanie funkcji fun_strukt_out (po deklaracji w p. 5.3.a i definicji w p. 5.3.b)
  //      z obiektem_1 jako argumentem i przepisaniem wyniku z powrotem do obiektu_1
  s1 = fun_struct_out(s1);

  // 5.4.2 wypisanie wartości pól zmiennej obiekt_1 z pomocą operatora .
  //    np. printf("Po wywołaniu fun_strukt_out i przypisaniu wyniku do obiekt_1\n");
  //        printf("- wartości pól obiekt_1: ....", ....);
  printf("\nPo powrocie i zapisaniu do s1 z fun_struct_out: Imie: %s, Nazwisko: %s, Wiek: %d lat, Średnia: %lf\n", s1.imie, s1.nazwisko, s1.wiek, s1.srednia);

  
  // 4.4 definicja drugiej zmiennej typu strukturalnego  (np. obiekt_2)
  //    połączona z inicjowaniem za pomocą listy wartości
  Student s2 = {"Jan", "Kowalski", 23, 5.0};

  // 4.5 definicja wskaźnika (np. obiekt_2_wsk) do struktury zainicjowanego adresem obiektu_2
  Student* wsk = &s2;

  // 4.6 wypisanie wartości pól obiektu_2 z pomocą wskaźnika do obiektu i operatora ->
  //    np. printf("Początkowe wartości pól obiekt_2: ....", ....);
  
  printf("\nWskaźnik: Imie: %s, Nazwisko: %s, Wiek: %d lat, Średnia: %lf\n", (*wsk).imie, (*wsk).nazwisko, wsk -> wiek, wsk -> srednia);

  // 5.6.1 wywołanie funkcji fun_strukt_wsk (po deklaracji w p. 5.5.a i definicji w p. 5.5.b)
  //      ze zmienną obiekt_2_wsk jako argumentem
  fun_struct_wsk(wsk);

  // 5.6.2 wypisanie wartości pól zmiennej obiekt_2 z pomocą wskaźnika do obiektu i operatora ->
  //    np. printf("Po wywołaniu fun_strukt_wsk - wartości pól obiekt_2: ....", ....);
  
  printf("\nWskaźnik po wywołaniu fun_struct_wsk: Imie: %s, Nazwisko: %s, Wiek: %d lat, Średnia: %lf\n", (*wsk).imie, (*wsk).nazwisko, wsk -> wiek, wsk -> srednia);

  // 4.7 definicja trzeciej zmiennej typu strukturalnego  (np. obiekt_3)
  //    połączona z inicjowaniem za pomocą przepisania zawartości obiektu_2 w jednej
  //    operacji przypisania
  Student s3 = s2;
  

  // 4.8 wypisanie wartości pól zmiennej obiekt_3 z pomocą operatora .
  //    np. printf("Początkowe wartości pól obiekt_3: ....", ....);
  printf("\nKopia: Imie: %s, Nazwisko: %s, Wiek: %d lat, Średnia: %lf\n", s3.imie, s3.nazwisko, s3.wiek, s3.srednia);

  //-------------------------------- 3.0 ------------------------------------

  // 8. wywołanie funkcji fun_strukt_wsk_kopia (po odpowiedniej deklaracji i definicji)
  //    z adresem obiektu 3 jako argumentem oraz przypisanie (skopiowanie) zwracanej przez
  //    fun_strukt_wsk_kopia struktury (z całą zawartością) do nowej zmiennej obiekt_4
  //    zaprojektowanego typu w operacji inicjowania

  //    wypisanie wartości pól zmiennej obiekt_4 z pomocą operatora .
  //    np. printf("Początkowe wartości pól obiekt_4: ....", ....);
  Student s4 = fun_struct_wsk_kopia(&s3);
  printf("\nS4 po przypisaniu z funkcji fun_struct_wsk_kopia: Imie: %s, Nazwisko: %s, Wiek: %d lat, Średnia: %lf\n", s4.imie, s4.nazwisko, s4.wiek, s4.srednia);

  // 10. wywołanie funkcji fun_strukt_wsk_inout (po odpowiedniej deklaracji i definicji)
  //     z adresem obiektu 4 jako argumentem

  //    wypisanie wartości pól zmiennej obiekt_4 z pomocą operatora .
  //    np. printf("Po wywołaniu fun_strukt_wsk_inout - wartości pól obiekt_4: ....", ....);
  fun_struct_wsk_inout(&s4);
  printf("\nS4 po powrocie z funkcji fun_struct_wsk_inout: Imie: %s, Nazwisko: %s, Wiek: %d lat, Średnia: %lf\n", s4.imie, s4.nazwisko, s4.wiek, s4.srednia);

  Student* wsk2 = fun_struct_wsk_out(s4);
  free(wsk2);
  wsk = NULL; // tak jest bezpieczniej
  
  //wypisywanie sizeof dla różnych rozmiarów tablic (1-5)
  printf("\nSize of S1: %zu\n", sizeof(struct S1));
  printf("\nSize of S1: %zu\n", sizeof(struct S2));
  printf("\nSize of S1: %zu\n", sizeof(struct S3));
  printf("\nSize of S1: %zu\n", sizeof(struct S4));
  printf("\nSize of S1: %zu\n", sizeof(struct S5));

  printf("Koniec programu.\n");

  
}

// 5.1.b definicja funkcji fun_strukt

//{

  // wypisanie wartości pól struktury przesłanej jako argument
  // np. printf("Wewnątrz fun_strukt - wartości pól obiektu argumentu: ...", ...);

  // modyfikacja wartości pól struktury

  // wypisanie zmodyfikowanych wartości pól struktury 
  // np. printf("Wewnątrz fun_strukt - zmodyfikowane wartości pól obiektu argumentu: ...", ...);

//}
void fun_struct(Student s){
    printf("\nWartości struktury Student w funkcji przed modyfikacją: Wiek: %d lat, Średnia: %lf\n", s.wiek, s.srednia);
    
    s.wiek+=5;
    s.srednia = s.srednia / 3;
    
    printf("\nWartości struktury Student w funkcji po modyfikacji: Wiek: %d lat, Średnia: %lf\n", s.wiek, s.srednia);
}


// 5.3.b definicja funkcji fun_strukt_out

//{

  // wypisanie wartości pól struktury przesłanej jako argument

  // modyfikacja wartości pól struktury

  // wypisanie zmodyfikowanych wartości pól struktury 

  // zwrócenie struktury ze zmodyfikowanymi wartościami pól do funkcji wywołującej

//}
Student fun_struct_out(Student s){
    s.wiek+=10;
    s.srednia = s.srednia / 5;
    
    printf("\nWartości struktury Student w funkcji fun_struct_out po modyfikacji: Wiek: %d lat, Średnia: %lf\n", s.wiek, s.srednia);
    
    return s;
}


// 5.5.b definicja funkcji fun_strukt_wsk

//{

  // wypisanie wartości pól struktury wskaźnik do której został przesłany jako argument

  // modyfikacja wartości pól struktury

  // wypisanie zmodyfikowanych wartości pól struktury 

//}
void fun_struct_wsk(Student* wsk){
    (*wsk).wiek+=10;
    wsk -> srednia = 3.0;
    
    printf("\nWartości struktury Student w funkcji fun_struct_wsk po modyfikacji: Wiek: %d lat, Średnia: %lf\n", (*wsk).wiek, wsk -> srednia);
}

Student fun_struct_wsk_kopia(Student* wsk){
    Student s = *wsk;
    s.wiek+=3;
    s.srednia = 4.5;
    
    printf("\nWartości struktury Student w funkcji fun_struct_wsk_kopia po modyfikacji: Wiek: %d lat, Średnia: %lf\n", s.wiek, s.srednia);
    return s;
}

void fun_struct_wsk_inout(Student* wsk){
    Student s = *wsk;
    s.wiek-=10;
    s.srednia = 2.5;
    
    printf("\nWartości struktury Student w funkcji fun_struct_wsk_inout po modyfikacji: Wiek: %d lat, Średnia: %lf\n", s.wiek, s.srednia);
    
    (*wsk).imie = s.imie;
    (*wsk).nazwisko = s.nazwisko;
    wsk -> wiek = s.wiek;
    wsk -> srednia = s.srednia;
}

Student* fun_struct_wsk_out(Student s){
    Student* wsk = malloc(sizeof(Student));
    printf("\nSize of Student: %zu\n", sizeof(Student));
    if(wsk == NULL){
        printf("Memory Allocation Error!");
        exit(0);
    }
    
    (*wsk) = s;
    
    return wsk;
}




