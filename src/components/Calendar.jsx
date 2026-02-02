import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BookingModal = ({ show, onClose, professional, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!professional) return null;

  // Get unique available dates
  const availableDates = [
    ...new Set(professional.availability.map(a => a.from_datetime.split("T")[0]))
  ];

  // Filter slots for selected date
  const slotsForDate = selectedDate
    ? professional.availability.filter(a =>
        a.from_datetime.startsWith(selectedDate.toISOString().split("T")[0])
      )
    : [];

  return (
    <div className={`modal ${show ? "d-block" : "d-none"}`} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{professional.full_name}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <h6>Select Date</h6>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null); // reset slot when date changes
              }}
              includeDates={availableDates.map(d => new Date(d))}
              placeholderText="Select a date"
              className="form-control"
            />

            {slotsForDate.length > 0 && (
              <>
                <h6 className="mt-3">Select Time Slot</h6>
                <div className="d-flex flex-wrap gap-2">
                  {slotsForDate.map((slot, idx) => (
                    <button
                      key={idx}
                      className={`btn btn-outline-primary ${
                        selectedSlot === idx ? "active" : ""
                      }`}
                      onClick={() => setSelectedSlot(idx)}
                    >
                      {new Date(slot.from_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(slot.to_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </button>
                  ))}
                </div>
              </>
            )}

          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={() => onConfirm(selectedDate, selectedSlot)}
              disabled={selectedSlot === null}
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
