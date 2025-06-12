
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Building, Bed, Wrench, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Room } from "@/types/hospital";

interface RoomManagementProps {
  userRole: "admin" | "doctor" | "staff";
}

const RoomManagement = ({ userRole }: RoomManagementProps) => {
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "room101",
      roomNumber: "101",
      type: "General",
      floor: 1,
      capacity: 2,
      currentOccupancy: 1,
      status: "Occupied",
      dailyRate: 200,
      amenities: ["TV", "Wi-Fi", "Private Bathroom"],
      assignedPatients: ["1"],
      equipment: ["Hospital Bed", "IV Stand", "Oxygen Outlet"],
      lastCleaned: new Date("2024-06-12"),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "room102",
      roomNumber: "102",
      type: "General",
      floor: 1,
      capacity: 2,
      currentOccupancy: 0,
      status: "Available",
      dailyRate: 200,
      amenities: ["TV", "Wi-Fi", "Private Bathroom"],
      assignedPatients: [],
      equipment: ["Hospital Bed", "IV Stand"],
      lastCleaned: new Date("2024-06-12"),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "room201",
      roomNumber: "201",
      type: "Private",
      floor: 2,
      capacity: 1,
      currentOccupancy: 1,
      status: "Occupied",
      dailyRate: 400,
      amenities: ["TV", "Wi-Fi", "Private Bathroom", "Refrigerator", "Sofa"],
      assignedPatients: ["2"],
      equipment: ["Electric Hospital Bed", "IV Stand", "Oxygen Outlet", "Cardiac Monitor"],
      lastCleaned: new Date("2024-06-11"),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "room301",
      roomNumber: "301",
      type: "ICU",
      floor: 3,
      capacity: 1,
      currentOccupancy: 0,
      status: "Maintenance",
      dailyRate: 800,
      amenities: ["Advanced Monitoring", "Ventilator Access"],
      assignedPatients: [],
      equipment: ["ICU Bed", "Ventilator", "Cardiac Monitor", "Defibrillator"],
      lastCleaned: new Date("2024-06-10"),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const { toast } = useToast();

  const [newRoom, setNewRoom] = useState({
    roomNumber: "",
    type: "",
    floor: "",
    capacity: "",
    dailyRate: "",
    amenities: "",
    equipment: ""
  });

  const handleAddRoom = () => {
    if (!newRoom.roomNumber || !newRoom.type || !newRoom.floor) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const room: Room = {
      id: `room_${Date.now()}`,
      roomNumber: newRoom.roomNumber,
      type: newRoom.type as "General" | "ICU" | "Private" | "Semi-Private" | "Emergency" | "Surgery",
      floor: parseInt(newRoom.floor),
      capacity: parseInt(newRoom.capacity) || 1,
      currentOccupancy: 0,
      status: "Available",
      dailyRate: parseFloat(newRoom.dailyRate) || 200,
      amenities: newRoom.amenities.split(",").map(a => a.trim()).filter(a => a),
      assignedPatients: [],
      equipment: newRoom.equipment.split(",").map(e => e.trim()).filter(e => e),
      lastCleaned: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setRooms([...rooms, room]);
    
    toast({
      title: "Room Added Successfully",
      description: `Room ${room.roomNumber} has been added to floor ${room.floor}`,
    });

    setNewRoom({
      roomNumber: "",
      type: "",
      floor: "",
      capacity: "",
      dailyRate: "",
      amenities: "",
      equipment: ""
    });
    setShowAddDialog(false);
  };

  const updateRoomStatus = (roomId: string, status: "Available" | "Occupied" | "Maintenance" | "Reserved") => {
    setRooms(rooms.map(room => 
      room.id === roomId 
        ? { ...room, status, updatedAt: new Date() }
        : room
    ));
    
    toast({
      title: "Status Updated",
      description: `Room status changed to ${status}`,
    });
  };

  const handleRoomCleaning = (roomId: string) => {
    setRooms(rooms.map(room => 
      room.id === roomId 
        ? { ...room, lastCleaned: new Date(), updatedAt: new Date() }
        : room
    ));
    
    toast({
      title: "Room Cleaned",
      description: "Room cleaning has been recorded",
    });
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.includes(searchTerm) ||
                         room.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "All" || room.type === typeFilter;
    const matchesStatus = statusFilter === "All" || room.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-800";
      case "Occupied": return "bg-blue-100 text-blue-800";
      case "Maintenance": return "bg-yellow-100 text-yellow-800";
      case "Reserved": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "General": return "bg-blue-100 text-blue-800";
      case "Private": return "bg-purple-100 text-purple-800";
      case "ICU": return "bg-red-100 text-red-800";
      case "Semi-Private": return "bg-green-100 text-green-800";
      case "Emergency": return "bg-orange-100 text-orange-800";
      case "Surgery": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === "Available").length;
  const occupiedRooms = rooms.filter(r => r.status === "Occupied").length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const roomTypes = [...new Set(rooms.map(room => room.type))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room & Bed Management</h1>
          <p className="text-muted-foreground">Manage hospital rooms, bed allocation, and occupancy</p>
        </div>
        {(userRole === "admin" || userRole === "staff") && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Room</DialogTitle>
                <DialogDescription>Fill in the room details below</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roomNumber">Room Number *</Label>
                    <Input
                      id="roomNumber"
                      value={newRoom.roomNumber}
                      onChange={(e) => setNewRoom({...newRoom, roomNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="floor">Floor *</Label>
                    <Input
                      id="floor"
                      type="number"
                      value={newRoom.floor}
                      onChange={(e) => setNewRoom({...newRoom, floor: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Room Type *</Label>
                    <Select onValueChange={(value) => setNewRoom({...newRoom, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Private">Private</SelectItem>
                        <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                        <SelectItem value="ICU">ICU</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                        <SelectItem value="Surgery">Surgery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="capacity">Bed Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={newRoom.capacity}
                      onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})}
                      placeholder="1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dailyRate">Daily Rate ($)</Label>
                  <Input
                    id="dailyRate"
                    type="number"
                    step="0.01"
                    value={newRoom.dailyRate}
                    onChange={(e) => setNewRoom({...newRoom, dailyRate: e.target.value})}
                    placeholder="200.00"
                  />
                </div>
                <div>
                  <Label htmlFor="amenities">Amenities (comma separated)</Label>
                  <Input
                    id="amenities"
                    value={newRoom.amenities}
                    onChange={(e) => setNewRoom({...newRoom, amenities: e.target.value})}
                    placeholder="TV, Wi-Fi, Private Bathroom"
                  />
                </div>
                <div>
                  <Label htmlFor="equipment">Equipment (comma separated)</Label>
                  <Input
                    id="equipment"
                    value={newRoom.equipment}
                    onChange={(e) => setNewRoom({...newRoom, equipment: e.target.value})}
                    placeholder="Hospital Bed, IV Stand, Oxygen Outlet"
                  />
                </div>
                <Button onClick={handleAddRoom} className="w-full">
                  Add Room
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRooms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
            <Bed className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableRooms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupiedRooms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room List</CardTitle>
          <CardDescription>Search and manage hospital rooms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by room number or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                {roomTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Occupied">Occupied</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Daily Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Cleaned</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.roomNumber}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(room.type)}>
                      {room.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{room.floor}</TableCell>
                  <TableCell>{room.currentOccupancy}/{room.capacity}</TableCell>
                  <TableCell>${room.dailyRate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(room.status)}>
                      {room.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{room.lastCleaned?.toLocaleDateString()}</TableCell>
                  <TableCell className="space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedRoom(room)}>
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Room Details</DialogTitle>
                          <DialogDescription>Room {room.roomNumber} - Floor {room.floor}</DialogDescription>
                        </DialogHeader>
                        {selectedRoom && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-semibold">Type</Label>
                                <p>
                                  <Badge className={getTypeColor(selectedRoom.type)}>
                                    {selectedRoom.type}
                                  </Badge>
                                </p>
                              </div>
                              <div>
                                <Label className="font-semibold">Status</Label>
                                <p>
                                  <Badge className={getStatusColor(selectedRoom.status)}>
                                    {selectedRoom.status}
                                  </Badge>
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-semibold">Capacity</Label>
                                <p>{selectedRoom.capacity} beds</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Daily Rate</Label>
                                <p>${selectedRoom.dailyRate}</p>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="font-semibold">Amenities</Label>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {selectedRoom.amenities.map((amenity, index) => (
                                  <Badge key={index} variant="outline">{amenity}</Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <Label className="font-semibold">Equipment</Label>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {selectedRoom.equipment.map((equipment, index) => (
                                  <Badge key={index} variant="outline">{equipment}</Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex gap-2 pt-4">
                              {selectedRoom.status === "Available" && (
                                <Button onClick={() => updateRoomStatus(selectedRoom.id, "Maintenance")}>
                                  Mark for Maintenance
                                </Button>
                              )}
                              {selectedRoom.status === "Maintenance" && (
                                <Button onClick={() => updateRoomStatus(selectedRoom.id, "Available")}>
                                  Mark Available
                                </Button>
                              )}
                              <Button variant="outline" onClick={() => handleRoomCleaning(selectedRoom.id)}>
                                Record Cleaning
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomManagement;
