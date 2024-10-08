import React, { useState } from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type GuestListManagerProps = {
  eventId: Id<"events">;
  promoterId: Id<"users">;
};

const GuestListPage = ({ eventId, promoterId }: GuestListManagerProps) => {
  const [guestNames, setGuestNames] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const result = useQuery(api.guestLists.getGuestListByPromoter, {
    clerkPromoterId: promoterId,
    eventId,
  });
  const addGuestList = useMutation(api.guestLists.addGuestList);
  const updateGuestName = useMutation(api.guestLists.updateGuestName);
  const deleteGuestName = useMutation(api.guestLists.deleteGuestName);

  if (result === undefined) {
    return <div>Loading...</div>;
  }
  const isEmptyGuestList = result.guestListId === null;

  const handleUpload = async () => {
    const names = guestNames
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name !== "");
    try {
      await addGuestList({
        newNames: names,
        clerkPromoterId: promoterId,
        eventId,
      });
      setGuestNames(""); // Clear the text area after successful upload
      alert("Guest list uploaded successfully!");
    } catch (error) {
      console.error("Error uploading guest list:", error);
      alert("Failed to upload guest list. Please try again.");
    }
  };

  const handleEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleSave = async (id: string) => {
    try {
      await updateGuestName({
        guestListId: result.guestListId!,
        guestId: id,
        newName: editName,
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error updating guest name:", error);
      alert("Failed to update guest name. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGuestName({
        guestListId: result.guestListId!,
        guestId: id,
      });
    } catch (error) {
      console.error("Error deleting guest:", error);
      alert("Failed to delete guest. Please try again.");
    }
  };

  return (
    <div>
      <h1>Guest List Page</h1>
      {isEmptyGuestList ? (
        <p>No guest list added</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.names.map((guest) => (
              <TableRow key={guest.id}>
                <TableCell>
                  {editingId === guest.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    guest.name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === guest.id ? (
                    <Button onClick={() => handleSave(guest.id)}>Save</Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => handleEdit(guest.id, guest.name)}
                      >
                        <FaPencilAlt className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(guest.id)}
                      >
                        <FaTrashAlt className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div>
        <textarea
          value={guestNames}
          onChange={(e) => setGuestNames(e.target.value)}
          placeholder="Enter guest names, one per line"
          rows={10}
          cols={50}
        />
      </div>
      <Button onClick={handleUpload}>Upload Guest List</Button>
    </div>
  );
};

export default GuestListPage;
