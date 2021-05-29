

/**
 * Class to handle and store new user scores periodically.
 */
class PeriodicScoreFetching {

    public runFetch() {

        // Obtener todos los users ordenados por lastPeriodicFetch más antiguo (se supone que se actualizarán todos los users, pero si scoresaber API limita las requests, algunos users quedarán desactualizados)
        // Para cada user:
            // Obtener su id de score más reciente, de la db
            // Mientras endPageReached=false
                // Obtener su página de scores n (o n=1 inicialmente)
                // Si da error en obtener score (max requests), terminar ejecucion.
                // Para cada score:
                    // Si el score id no es el ultimo registrado
                        // Guardar en la db
                    // Si es el ultimo registrado
                        // Updatear lastPeriodicFetch del user a now()
                        // setear endPageReached=true
                        // Breakear este loop
                // Incrementar n+=1

    }


    public onUserNewScoreSubmit() {
        // Si el score es relevante (ver cómo, si es mayor a cierto pp, o a cierto pp de acuerdo a su nivel, o que onda)
            // Si es user de arg:
                // Obtener score y user con más pp de esa cancion de users de dicho pais (usar join)
                // Si el score es mas alto
                    // Tirar anuncio picante
    }


}