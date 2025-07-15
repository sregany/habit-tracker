import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
from db import (
    connect, add_habit, get_habits,
    mark_progress, get_progress_by_habit,
    delete_habit, update_habit_name
)

# 🧱 Inicializar base de datos
connect()
st.set_page_config(page_title="Habit Tracker", layout="wide")

# 🏷️ Título
st.title("🎯 Seguimiento de Hábitos")
st.caption("Registra tus rutinas, edita y visualiza tu progreso de forma clara y motivadora.")

# ➕ Añadir hábito
st.subheader("➕ Añadir nuevo hábito")
new_habit = st.text_input("Hábito")

if st.button("Guardar hábito"):
    if new_habit.strip():
        add_habit(new_habit.strip())
        st.success(f"Hábito '{new_habit.strip()}' añadido correctamente.")
        st.rerun()
    else:
        st.error("Por favor, escribe un nombre válido.")

# 📋 Mostrar hábitos activos
habits = get_habits()
if habits:
    st.subheader("🧠 Hábitos registrados")

    for habit_id, habit_name, created_at in habits:
        row_text, row_actions = st.columns([5, 3])

        # 🟢 Punto con tooltip al pasar el cursor
        punto_html = f"""
        <span title="Hábito: {habit_name}\nCreado el: {created_at}" 
              style="font-size: 1.5em; margin-right: 10px; cursor: default;">🟢</span>
        """

        with row_text:
            st.markdown(punto_html, unsafe_allow_html=True)

        with row_actions:
            col_mod, col_del, col_done = st.columns(3)

            # ✏️ Modificar nombre
            with col_mod:
                new_name = st.text_input("", value=habit_name, key=f"edit_{habit_id}", label_visibility="collapsed")
                if st.button("✏️", key=f"upd_{habit_id}"):
                    if new_name.strip():
                        update_habit_name(habit_id, new_name.strip())
                        st.success(f"Hábito actualizado a '{new_name.strip()}'.")
                        st.rerun()
                    else:
                        st.error("El nuevo nombre no puede estar vacío.")

            # 🗑️ Eliminar hábito
            with col_del:
                if st.button("🗑️", key=f"del_{habit_id}"):
                    delete_habit(habit_id)
                    st.warning(f"Hábito '{habit_name}' eliminado.")
                    st.rerun()

            # ✅ Marcar como cumplido
            with col_done:
                if st.button("✅", key=f"done_{habit_id}"):
                    mark_progress(habit_id)
                    st.success(f"Hábito '{habit_name}' registrado para hoy.")
                    st.rerun()

        st.markdown("<hr style='margin-top: 8px; margin-bottom: 12px;'>", unsafe_allow_html=True)

    # 📈 Estadísticas visuales
    st.subheader("📊 Progreso visual de hábitos")

    for habit_id, habit_name, _ in habits:
        progress = get_progress_by_habit(habit_id)
        if progress:
            x = list(range(len(progress)))
            y = [1] * len(progress)

            fig, ax = plt.subplots()
            ax.scatter(x, y, color="mediumseagreen")

            for i, (fecha, _) in enumerate(progress):
                ax.annotate(
                    fecha,
                    (x[i], y[i]),
                    textcoords="offset points",
                    xytext=(0, 10),
                    ha="center",
                    fontsize=8,
                    color="gray"
                )

            ax.set_title(f"Hábito: {habit_name}")
            ax.set_yticks([])
            ax.set_xticks([])
            ax.set_xlim(-1, len(progress) + 1)
            ax.set_facecolor("#f9f9f9")
            ax.grid(False)

            st.pyplot(fig)
        else:
            st.info(f"Sin registros aún para '{habit_name}'")
else:
    st.info("🪷 No has añadido hábitos todavía.")