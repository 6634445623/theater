function emptyOrRows(rows) {
  if (!rows) {
    return [];
  }
  return rows;
}

function validID(id) {
  if(!id){
    return false
  }
  return !isNaN(id)
}

function formatSchedule(rows) {
  const result = {};

  for (const row of rows) {
    const { id, date, theatre_name, start_time, available } = row;

    if (!result[date]) {
      result[date] = {};
    }
    if (!result[date][theatre_name]) {
      result[date][theatre_name] = {};
    }
    result[date][theatre_name][start_time] = { available, scheduleId: id };
  }

  return result;
}

function formatSeats(data) {
  const result = {};

  for (const seat of data) {
    const zone = seat.zone_name;
    const row = seat.row;
    const seatId = seat.seat_id;
    
    if (!result[zone]) {
      result[zone] = {};
    }
    if (!result[zone][row]) {
      result[zone][row] = [];
    }
    result[zone][row].push({
      id: seatId,
      status: seat.status || 'available'
    });
  }

  // Sort rows within each zone
  for (const zone of Object.keys(result)) {
    const sortedRows = {};
    Object.keys(result[zone])
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach(row => {
        sortedRows[row] = result[zone][row].sort((a, b) => parseInt(a.id) - parseInt(b.id));
      });
    result[zone] = sortedRows;
  }

  return result;
}

module.exports = {
  emptyOrRows,
  validID,
  formatSchedule,
  formatSeats
}