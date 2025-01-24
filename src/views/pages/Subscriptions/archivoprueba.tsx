import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tu-email@gmail.com',
        pass: 'tu-contraseña',
    },
});

const handleSaveChanges = async () => {
    if (selectedPerson) {
        try {
            let updateData;
            if (selectedPerson.status === 'Por Aprobar') {
                // Datos para limpiar fechas
                updateData = {
                    status: selectedPerson.status,
                    fecha_inicio: null,
                    fecha_fin: null,
                    monto: selectedPerson.monto ?? '',
                    nombre: selectedPerson.nombre,
                    vigencia: selectedPerson.vigencia,
                };
                await updateDoc(
                    doc(db, 'Subscripciones', selectedPerson.uid),
                    updateData,
                );
                if (selectedPerson.taller_uid) {
                    await updateDoc(
                        doc(db, 'Usuarios', selectedPerson.taller_uid),
                        { subscripcion_actual: updateData },
                    );
                }

                // Notificación de éxito
                toast.push(
                    <Notification title="Éxito">
                        Subscripción actualizada con éxito.
                    </Notification>,
                );

                setDrawerIsOpen(false);
                getData();
                return;
            }

            const fechaInicio = new Date();
            const vigenciaDias = parseInt(selectedPerson.vigencia, 10);

            if (isNaN(vigenciaDias)) {
                toast.push(
                    <Notification title="Error">
                        La vigencia proporcionada no es válida.
                    </Notification>,
                );
                return;
            }

            const fechaFin = new Date(fechaInicio);
            fechaFin.setDate(fechaInicio.getDate() + vigenciaDias);

            // Datos de actualización
            updateData = {
                nombre: selectedPerson.nombre,
                vigencia: selectedPerson.vigencia,
                fecha_inicio: Timestamp.fromDate(fechaInicio),
                fecha_fin: Timestamp.fromDate(fechaFin),
                status: selectedPerson.status,
                cantidad_servicios: selectedPerson.cantidad_servicios,
                monto: selectedPerson.monto,
            };
            await updateDoc(
                doc(db, 'Subscripciones', selectedPerson.uid),
                updateData,
            );
            if (selectedPerson.taller_uid) {
                await updateDoc(
                    doc(db, 'Usuarios', selectedPerson.taller_uid),
                    { subscripcion_actual: updateData },
                );
            }

            // Enviar correo electrónico
            const mailOptions = {
                from: 'tu-email@gmail.com',
                to: selectedPerson.correo_taller,
                subject: 'Subscripción Aprobada',
                text: `Hola ${selectedPerson.nombre_taller}, tu subscripción ha sido aprobada.`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error enviando el correo:', error);
                } else {
                    console.log('Correo enviado:', info.response);
                }
            });

            toast.push(
                <Notification title="Éxito">
                    Subscripción actualizada con éxito.
                </Notification>,
            );

            setDrawerIsOpen(false);
            getData();
        } catch (error) {
            console.error('Error actualizando la subscripción:', error);
            toast.push(
                <Notification title="Error">
                    Hubo un error al actualizar la subscripción.
                </Notification>,
            );
        }
    }
};